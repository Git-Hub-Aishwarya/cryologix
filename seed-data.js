// seed-data.js — Cryologix V0 reefer truck listings
// Exposes window.CRYOLOGIX_TRUCKS as an array of 12 reefer listings.
// All fields per V1.1 schema. No imports — plain script-tag global.

(function () {
  'use strict';

  var TRUCKS = [
    // 1) Mumbai -> Chennai, exact lane, vacant, verified — flagship match for the test req
    {
      id: 'T-9K2A1X',
      ownerName: 'Patel Cold Carriers',
      fleetSize: 12,
      verified: true,
      truckSize: '20ft',
      capacityKg: 16000,
      tempRanges: ['2-8', '15-25'],
      fromCity: 'Mumbai',
      fromPin: '400001',
      toCity: 'Chennai',
      toPin: '600001',
      date: '2026-05-02',
      status: 'vacant',
      basePrice: 8000,
      perKm: 42,
      minTrip: 15000
    },
    // 2) Mumbai -> Chennai, same area pins (forward, area match)
    {
      id: 'T-7QF3M2',
      ownerName: 'Genesis Reefer Logistics',
      fleetSize: 8,
      verified: true,
      truckSize: '24ft',
      capacityKg: 20000,
      tempRanges: ['2-8', '15-25', '-15--25'],
      fromCity: 'Mumbai',
      fromPin: '400051',
      toCity: 'Chennai',
      toPin: '600042',
      date: '2026-05-03',
      status: 'vacant',
      basePrice: 10000,
      perKm: 48,
      minTrip: 18000
    },
    // 3) Chennai -> Mumbai, BACKHAUL candidate
    {
      id: 'T-3BH4PL',
      ownerName: 'Coromandel Reefer Network',
      fleetSize: 5,
      verified: true,
      truckSize: '20ft',
      capacityKg: 12000,
      tempRanges: ['2-8', '15-25'],
      fromCity: 'Chennai',
      fromPin: '600001',
      toCity: 'Mumbai',
      toPin: '400001',
      date: '2026-05-01',
      status: 'backhaul',
      basePrice: 6500,
      perKm: 38,
      minTrip: 12000
    },
    // 4) Mumbai -> Delhi, vacant, verified
    {
      id: 'T-MD8R5C',
      ownerName: 'Bharat ColdChain Movers',
      fleetSize: 22,
      verified: true,
      truckSize: '32ft',
      capacityKg: 20000,
      tempRanges: ['15-25', '-15--25'],
      fromCity: 'Mumbai',
      fromPin: '400070',
      toCity: 'Delhi',
      toPin: '110001',
      date: '2026-04-28',
      status: 'vacant',
      basePrice: 12000,
      perKm: 55,
      minTrip: 22000
    },
    // 5) Delhi -> Mumbai, backhaul
    {
      id: 'T-DM2NQ7',
      ownerName: 'Aryan Cold Express',
      fleetSize: 4,
      verified: false,
      truckSize: '24ft',
      capacityKg: 12000,
      tempRanges: ['2-8'],
      fromCity: 'Delhi',
      fromPin: '110045',
      toCity: 'Mumbai',
      toPin: '400001',
      date: '2026-05-05',
      status: 'backhaul',
      basePrice: 9000,
      perKm: 50,
      minTrip: 20000
    },
    // 6) Pune -> Bangalore, partial (so half-capacity rule fires)
    {
      id: 'T-PB6X9V',
      ownerName: 'Sahyadri Frost Lines',
      fleetSize: 7,
      verified: true,
      truckSize: '24ft',
      capacityKg: 16000,
      tempRanges: ['2-8', '15-25'],
      fromCity: 'Pune',
      fromPin: '411001',
      toCity: 'Bangalore',
      toPin: '560001',
      date: '2026-05-04',
      status: 'partial',
      basePrice: 7500,
      perKm: 45,
      minTrip: 14000
    },
    // 7) Bangalore -> Pune, BACKHAUL candidate (reverse direction)
    {
      id: 'T-BP4HK1',
      ownerName: 'South Cross Reefer Co.',
      fleetSize: 9,
      verified: true,
      truckSize: '20ft',
      capacityKg: 10000,
      tempRanges: ['2-8', '15-25', '-15--25'],
      fromCity: 'Bangalore',
      fromPin: '560078',
      toCity: 'Pune',
      toPin: '411014',
      date: '2026-05-06',
      status: 'backhaul',
      basePrice: 7000,
      perKm: 40,
      minTrip: 13000
    },
    // 8) Hyderabad -> Bangalore, vacant
    {
      id: 'T-HB1Z3W',
      ownerName: 'Krishna Cool Freight',
      fleetSize: 11,
      verified: false,
      truckSize: '20ft',
      capacityKg: 10000,
      tempRanges: ['15-25'],
      fromCity: 'Hyderabad',
      fromPin: '500001',
      toCity: 'Bangalore',
      toPin: '560001',
      date: '2026-04-30',
      status: 'vacant',
      basePrice: 5500,
      perKm: 36,
      minTrip: 9000
    },
    // 9) Bangalore -> Hyderabad, partial
    {
      id: 'T-BH5T8L',
      ownerName: 'Deccan Frostway',
      fleetSize: 6,
      verified: false,
      truckSize: '24ft',
      capacityKg: 16000,
      tempRanges: ['2-8', '-15--25'],
      fromCity: 'Bangalore',
      fromPin: '560043',
      toCity: 'Hyderabad',
      toPin: '500032',
      date: '2026-05-08',
      status: 'partial',
      basePrice: 6000,
      perKm: 38,
      minTrip: 10000
    },
    // 10) Ahmedabad -> Mumbai, backhaul
    {
      id: 'T-AM7G2Y',
      ownerName: 'Maharashtra Thermo Logistics',
      fleetSize: 14,
      verified: true,
      truckSize: '32ft',
      capacityKg: 20000,
      tempRanges: ['15-25', '-15--25'],
      fromCity: 'Ahmedabad',
      fromPin: '380001',
      toCity: 'Mumbai',
      toPin: '400001',
      date: '2026-05-07',
      status: 'backhaul',
      basePrice: 5000,
      perKm: 35,
      minTrip: 8000
    },
    // 11) Mumbai -> Ahmedabad, vacant
    {
      id: 'T-MA3J5D',
      ownerName: 'Western Cool Lines',
      fleetSize: 3,
      verified: false,
      truckSize: '20ft',
      capacityKg: 8000,
      tempRanges: ['2-8'],
      fromCity: 'Mumbai',
      fromPin: '400001',
      toCity: 'Ahmedabad',
      toPin: '380015',
      date: '2026-04-26',
      status: 'vacant',
      basePrice: 5500,
      perKm: 38,
      minTrip: 8500
    },
    // 12) Mumbai -> Chennai exact PIN match (forward exact lane + pin) — high-score candidate
    {
      id: 'T-EXMTC9',
      ownerName: 'TruckIndia Cold (TIC)',
      fleetSize: 18,
      verified: false,
      truckSize: '32ft',
      capacityKg: 20000,
      tempRanges: ['2-8', '-15--25'],
      fromCity: 'Mumbai',
      fromPin: '400001',
      toCity: 'Chennai',
      toPin: '600001',
      date: '2026-05-02',
      status: 'vacant',
      basePrice: 9500,
      perKm: 44,
      minTrip: 16000
    }
  ];

  window.CRYOLOGIX_TRUCKS = TRUCKS;
})();
