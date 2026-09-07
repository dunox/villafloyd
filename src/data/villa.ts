import bbqTerrace from '../assets/images/bbq-terrace.webp';
import coastSunset from '../assets/images/coast-sunset.webp';
import courtyardEntry from '../assets/images/courtyard-entry.webp';
import diningArea from '../assets/images/dining-area.webp';
import diningRoom from '../assets/images/dining-room.webp';
import entranceLounge from '../assets/images/entrance-lounge.webp';
import gardenLounge from '../assets/images/garden-lounge.webp';
import gardenSteps from '../assets/images/garden-steps.webp';
import gardenTerraceDaybedDining from '../assets/images/garden-terrace-daybed-dining.webp';
import oceanViewTerrace from '../assets/images/hot-tub.webp';
import kitchenArchway from '../assets/images/kitchen-archway.webp';
import kitchenDetail from '../assets/images/kitchen-detail.webp';
import kitchenMain from '../assets/images/kitchen-main.webp';
import kitchenWide from '../assets/images/kitchen-wide.webp';
import livingRoom from '../assets/images/living-room.webp';
import livingRoomOverview from '../assets/images/living-room-overview.webp';
import livingRoomStoneFireplaceTable from '../assets/images/living-room-stone-fireplace-table.webp';
import livingRoomTvWorkspace from '../assets/images/living-room-tv-workspace.webp';
import livingSeaView from '../assets/images/living-sea-view.webp';
import masterBedroom from '../assets/images/master-bedroom.webp';
import musicCornerKeyboard from '../assets/images/music-corner-keyboard.webp';
import poolSunset from '../assets/images/pool-sunset.webp';
import poolTerrace from '../assets/images/pool-terrace.webp';
import poolView from '../assets/images/pool-view.webp';
import poolWithSeaView from '../assets/images/pool-with-sea-view.webp';
import poolsideTerraceMountainView from '../assets/images/poolside-terrace-hot-tub-mountain-view.webp';
import poolChaiseLongue from '../assets/images/poolside-terrace-loungers-hot-tub.webp';
import shadedPoolsideTerrace from '../assets/images/shaded-poolside-terrace.webp';
import splitLevelLivingDiningRoom from '../assets/images/split-level-living-dining-room.webp';
import stoneFireplaceCloseUp from '../assets/images/stone-fireplace-close-up.webp';
import terraceBarbecueGrill from '../assets/images/terrace-barbecue-grill.webp';
import twinBedroom from '../assets/images/twin-bedroom.webp';
import villaArchway from '../assets/images/villa-archway.webp';
import villaEntrance from '../assets/images/villa-entrance.webp';
import villaExterior from '../assets/images/villa-exterior.webp';
import villaStreetView from '../assets/images/villa-street-view.webp';
import type { Amenity, Highlight, Review } from '../types';

export const images = {
  hero: villaExterior,
  villaExterior,
  villaEntrance,
  villaStreetView,
  villaArchway,
  courtyardEntry,
  gardenLounge,
  gardenSteps,
  gardenTerraceDaybedDining,
  living: livingRoom,
  livingRoom,
  livingOverview: livingRoomOverview,
  livingRoomStoneFireplaceTable,
  livingRoomTvWorkspace,
  livingSeaView,
  entranceLounge,
  musicCornerKeyboard,
  pool: poolTerrace,
  poolSunset,
  poolTerrace,
  poolView,
  poolWithSeaView,
  poolsideTerraceMountainView,
  poolChaiseLongue,
  shadedPoolsideTerrace,
  kitchen: kitchenMain,
  kitchenMain,
  kitchenArchway,
  kitchenWide,
  kitchenDetail,
  bedroom: masterBedroom,
  masterBedroom,
  twinBedroom,
  terrace: oceanViewTerrace,
  oceanViewTerrace,
  dining: diningArea,
  diningArea,
  diningRoom,
  splitLevelLivingDiningRoom,
  stoneFireplaceCloseUp,
  bbqTerrace,
  terraceBarbecueGrill,
  coast: coastSunset,
  coastSunset,
};

export const highlights: Highlight[] = [
  { value: '2', label: 'bedrooms' },
  { value: '6', label: 'guests' },
  { value: '8 × 4 m', label: 'private pool' },
  { value: 'Extensive', label: 'ocean views' },
];

export const amenities: Amenity[] = [
  {
    image: poolWithSeaView,
    imageAlt: 'Sea-view terrace beside the private pool',
    title: 'Sea-view terrace',
    description: 'A peaceful terrace with extensive sea views.',
  },
  {
    image: livingRoomOverview,
    imageAlt: 'Villa Floyd lounge with air conditioning',
    title: 'Air conditioning',
    description: 'Air conditioning in both bedrooms and the main lounge.',
  },
  {
    image: bbqTerrace,
    imageAlt: 'Barbecue area on the Villa Floyd terrace',
    title: 'Barbeque zone',
    description: 'A dedicated barbecue area for relaxed outdoor meals with family and friends.',
  },
  {
    image: livingRoomTvWorkspace,
    imageAlt: 'Comfortable lounge with a 55-inch Smart TV and entertainment system',
    title: '55” Smart TV',
    description: 'Internet programming, sports, films, series, radio, DVD and music library.',
  },
  {
    image: diningArea,
    imageAlt: 'Bright dining space at Villa Floyd',
    title: 'Fast fibre Wi-Fi',
    description: 'Complimentary fibre internet with a wired LAN connection available.',
  },
  {
    image: poolChaiseLongue,
    imageAlt: 'Private Villa Floyd swimming pool and sun loungers',
    title: 'Private pool',
    description: 'An 8 × 4 metre pool on a secluded, sea-facing terrace.',
  },
  {
    image: masterBedroom,
    imageAlt: 'Prepared double bedroom with fresh white linen',
    title: 'Quality linen',
    description: 'Fresh bed linen, bath towels, hand towels and terrace towels are supplied.',
  },
  {
    image: coastSunset,
    imageAlt: 'Wide sunset view across the Mediterranean coast and mountains',
    title: 'Sea and mountain views',
    description: 'Open views toward the Mediterranean and the Mijas mountains.',
  },
];

export const reviews: Review[] = [
  {
    quote:
      'The terrace was the heart of our stay. Breakfast with the sea below, long afternoons by the pool and quiet evenings taking in the extensive sea views.',
    author: 'Amelia R.',
    stay: 'London · family stay',
  },
  {
    quote:
      'Spacious, genuinely private and wonderfully homely. The train from the airport made arrival effortless, even with children.',
    author: 'Daniel M.',
    stay: 'Manchester · 7 nights',
  },
  {
    quote:
      'We loved watching the cruise ships arrive in Málaga and the sunset over the coast. Villa Floyd feels peaceful without being isolated.',
    author: 'Sophie L.',
    stay: 'Brussels · couples trip',
  },
];

export const nightlyRate = 295;
export const cleaningFee = 120;
