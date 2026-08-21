import { images } from '../../data/villa';
import Container from '../../ui/Container';
import SectionHeading from '../SectionHeading';
import styles from './styles/index.module.scss';

const galleryItems = [
  { src: images.gardenLounge, alt: 'Secluded garden lounge at Villa Floyd', className: 'tall' },
  { src: images.villaEntrance, alt: 'Front entrance to Villa Floyd', className: 'standard' },
  { src: images.gardenSteps, alt: 'Garden steps through palms and flowering plants', className: 'tall' },
  { src: images.villaArchway, alt: 'White Mediterranean arches and garden at Villa Floyd', className: 'standard' },
  { src: images.gardenTerraceDaybedDining, alt: 'Garden terrace with a shaded daybed and outdoor dining area', className: 'wide' },
  { src: images.hotTub, alt: 'HotTub with sea views', className: 'standard' },
  { src: images.poolWithSeaView, alt: 'Private pool overlooking the Mediterranean Sea', className: 'standard' },
  { src: images.poolsideTerraceHotTubMountainView, alt: 'Poolside hot tub with a view towards the Mijas mountains', className: 'wide' },
  { src: images.shadedPoolsideTerrace, alt: 'Shaded seating area beside the private pool', className: 'standard' },
  { src: images.bbqTerrace, alt: 'Barbecue area on the Villa Floyd terrace', className: 'standard' },
  { src: images.masterBedroom, alt: 'Double bedroom with sea views', className: 'tall' },
  { src: images.livingOverview, alt: 'Main lounge with television, fireplace and air conditioning', className: 'standard' },
  { src: images.livingRoomStoneFireplaceTable, alt: 'Living room seating around the stone fireplace and coffee table', className: 'standard' },
  { src: images.livingRoomTvWorkspace, alt: 'Living room television and workspace', className: 'standard' },
  { src: images.musicCornerKeyboard, alt: 'Music corner with keyboard in the living area', className: 'standard' },
  { src: images.stoneFireplaceCloseUp, alt: 'Rustic stone fireplace in the Villa Floyd lounge', className: 'standard' },
  { src: images.kitchenMain, alt: 'Modern turquoise kitchen at Villa Floyd', className: 'standard' },
  { src: images.kitchenDetail, alt: 'Kitchen worktop and appliance details', className: 'wide' },
  { src: images.kitchenWide, alt: 'Wide view of the fully equipped kitchen', className: 'wide' },
  { src: images.kitchenArchway, alt: 'Fully equipped kitchen seen through the interior archway', className: 'standard' },
  { src: images.diningArea, alt: 'Dining area seating six guests', className: 'standard' },
  { src: images.splitLevelLivingDiningRoom, alt: 'Split-level living and dining room', className: 'wide' },
  { src: images.entranceLounge, alt: 'Spacious entrance lounge with additional single beds', className: 'wide' },
  { src: images.twinBedroom, alt: 'Twin bedroom at Villa Floyd', className: 'standard' },

];

function Gallery() {
  return (
    <section className={styles.gallerySection} id="gallery">
      <Container>
        <div className={styles.headingRow}>
          <SectionHeading
            eyebrow="Inside and out"
            title="Made for easy days and long evenings."
          />
          <p>
            Explore the gardens, pool terrace and relaxed interiors of Villa Floyd — from quiet shaded
            corners outside to the kitchen, lounge and bedrooms within.
          </p>
        </div>
        <div className={styles.grid}>
          {galleryItems.map((item, index) => (
            <figure className={`${styles.item} ${styles[item.className]}`} key={`${item.alt}-${index}`}>
              <img src={item.src} alt={item.alt} loading={index > 1 ? 'lazy' : 'eager'} />
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Gallery;
