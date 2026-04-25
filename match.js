// match.js — Cryologix V0 matching engine (V1.1 §5.4)
// Exposes window.cryologixMatch(req) returning up to 8 match objects, score-desc.
// Depends on window.CRYOLOGIX_TRUCKS from seed-data.js.

(function () {
  'use strict';

  var LANE_DISTANCES_KM = {
    'Mumbai|Chennai': 1330, 'Chennai|Mumbai': 1330,
    'Mumbai|Delhi': 1400, 'Delhi|Mumbai': 1400,
    'Pune|Bangalore': 840, 'Bangalore|Pune': 840,
    'Hyderabad|Bangalore': 570, 'Bangalore|Hyderabad': 570,
    'Ahmedabad|Mumbai': 530, 'Mumbai|Ahmedabad': 530
  };

  function getLaneDistance(fromCity, toCity) {
    return LANE_DISTANCES_KM[fromCity + '|' + toCity] || 800;
  }

  // |daysBetween| using UTC midnights so DST/timezones don't drift the count.
  function daysBetween(dateStrA, dateStrB) {
    var a = new Date(dateStrA + 'T00:00:00Z').getTime();
    var b = new Date(dateStrB + 'T00:00:00Z').getTime();
    return Math.abs(Math.round((a - b) / 86400000));
  }

  function pinArea(pin) {
    return (pin || '').toString().slice(0, 3);
  }

  function effectiveCapacity(truck) {
    return truck.status === 'partial' ? truck.capacityKg / 2 : truck.capacityKg;
  }

  // Returns true if the truck's lane shares at least one endpoint with the req lane.
  function laneOverlap(truck, req) {
    var forward = truck.fromCity === req.fromCity && truck.toCity === req.toCity;
    var reverse = truck.fromCity === req.toCity && truck.toCity === req.fromCity;
    var sharedEndpoint =
      truck.fromCity === req.fromCity ||
      truck.fromCity === req.toCity ||
      truck.toCity === req.fromCity ||
      truck.toCity === req.toCity;
    return forward || reverse || sharedEndpoint;
  }

  // Pretty INR for the capacity reason label.
  function fmt(n) {
    return n.toLocaleString('en-IN');
  }

  function scoreTruck(truck, req) {
    var reasons = [];
    var score = 0;

    // ─── Lane (mutually exclusive) ─────────────────────────────────────────
    var forward = truck.fromCity === req.fromCity && truck.toCity === req.toCity;
    var reverse = truck.fromCity === req.toCity && truck.toCity === req.fromCity;
    var fromAreaMatch = pinArea(truck.fromPin) === pinArea(req.fromPin);
    var toAreaMatch = pinArea(truck.toPin) === pinArea(req.toPin);
    var fromPinExact = truck.fromPin === req.fromPin;
    var toPinExact = truck.toPin === req.toPin;

    var lanePts = 0;
    var laneLabel = '';
    if (forward && fromPinExact && toPinExact) {
      lanePts = 50;
      laneLabel = 'Exact lane + pincode';
    } else if (forward && fromAreaMatch && toAreaMatch) {
      lanePts = 42;
      laneLabel = 'Same pincode area';
    } else if (forward) {
      lanePts = 36;
      laneLabel = 'Forward city match';
    } else if (reverse && truck.status === 'backhaul') {
      lanePts = 30;
      laneLabel = 'Backhaul match';
    } else if (reverse) {
      lanePts = 20;
      laneLabel = 'Reverse-lane opportunity';
    } else {
      lanePts = 12;
      laneLabel = 'Partial corridor';
    }
    score += lanePts;
    reasons.push({ label: laneLabel, points: lanePts, type: 'lane' });

    // ─── Temp (always fires once hard constraint passes) ───────────────────
    score += 18;
    reasons.push({ label: 'Temp range supported', points: 18, type: 'temp' });

    // ─── Capacity (fits + right-sized) ─────────────────────────────────────
    var effCap = effectiveCapacity(truck);
    var capPts = 0;
    if (effCap >= req.loadKg) capPts += 10;
    if (req.loadKg > truck.capacityKg * 0.5) capPts += 10;
    if (capPts > 0) {
      var capLabel = 'Capacity fit · ' + fmt(req.loadKg) + '/' + fmt(truck.capacityKg) + ' kg';
      score += capPts;
      reasons.push({ label: capLabel, points: capPts, type: 'capacity' });
    }

    // ─── Date proximity ────────────────────────────────────────────────────
    var diff = daysBetween(truck.date, req.date);
    var datePts = 0;
    var dateLabel = '';
    if (diff === 0) { datePts = 20; dateLabel = 'Same-day pickup'; }
    else if (diff === 1) { datePts = 14; dateLabel = '±1 day pickup'; }
    else { datePts = 8; dateLabel = '±' + diff + ' days pickup'; } // diff is 2 or 3 (hard constraint)
    score += datePts;
    reasons.push({ label: dateLabel, points: datePts, type: 'date' });

    // ─── Price ─────────────────────────────────────────────────────────────
    var dist = getLaneDistance(truck.fromCity, truck.toCity);
    var estimatedPrice = Math.max(truck.basePrice + truck.perKm * dist, truck.minTrip);
    var pricePts = 0;
    var priceLabel = '';
    if (estimatedPrice >= req.minPrice && estimatedPrice <= req.maxPrice) {
      pricePts = 22; priceLabel = 'Within budget';
    } else if (estimatedPrice < req.minPrice) {
      pricePts = 14; priceLabel = 'Under budget';
    } else if (estimatedPrice <= req.maxPrice * 1.10) {
      pricePts = 5; priceLabel = 'Slightly over budget';
    }
    if (pricePts > 0) {
      score += pricePts;
      reasons.push({ label: priceLabel, points: pricePts, type: 'price' });
    }

    // ─── Verified badge ────────────────────────────────────────────────────
    if (truck.verified === true) {
      score += 6;
      reasons.push({ label: 'Verified carrier', points: 6, type: 'badge' });
    }

    // ─── Status surfacing (informational; backhaul lane already scored above)
    if (truck.status === 'backhaul' && reverse) {
      reasons.push({ label: 'Backhaul availability', points: 0, type: 'status' });
    }

    // Order reasons by points desc; non-scoring (status) sinks to the bottom.
    reasons.sort(function (a, b) { return b.points - a.points; });

    return {
      truck: truck,
      score: score,
      reasons: reasons,
      estimatedPrice: estimatedPrice,
      laneDistanceKm: dist
    };
  }

  function passesHardConstraints(truck, req) {
    // Temp range required
    if (!truck.tempRanges || truck.tempRanges.indexOf(req.tempRange) === -1) return false;

    // Capacity (with partial halving)
    if (effectiveCapacity(truck) < req.loadKg) return false;

    // Date within ±3 days
    if (daysBetween(truck.date, req.date) > 3) return false;

    // Lane overlap (forward, reverse, or any shared endpoint)
    if (!laneOverlap(truck, req)) return false;

    return true;
  }

  function cryologixMatch(req) {
    var trucks = window.CRYOLOGIX_TRUCKS || [];
    var matches = [];
    for (var i = 0; i < trucks.length; i++) {
      var t = trucks[i];
      if (!passesHardConstraints(t, req)) continue;
      matches.push(scoreTruck(t, req));
    }
    matches.sort(function (a, b) { return b.score - a.score; });
    return matches.slice(0, 8);
  }

  window.cryologixMatch = cryologixMatch;
  // Exposed for unit-testing/debug; safe to ignore.
  window.__cryologixInternal = {
    getLaneDistance: getLaneDistance,
    daysBetween: daysBetween,
    effectiveCapacity: effectiveCapacity
  };
})();
