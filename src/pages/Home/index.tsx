import Amenities from '../../components/Amenities';
import BookingCta from '../../components/BookingCta';
import Footer from '../../components/Footer';
import Gallery from '../../components/Gallery';
import Header from '../../components/Header';
import Hero from '../../components/Hero';
import Highlights from '../../components/Highlights';
import Location from '../../components/Location';
import Reviews from '../../components/Reviews';
import Story from '../../components/Story';
import VillaIntro from '../../components/VillaIntro';

function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <VillaIntro />
        <Highlights />
        <Gallery />
        <Amenities />
        <Story />
        <Location />
        <Reviews />
        <BookingCta />
      </main>
      <Footer />
    </>
  );
}

export default Home;
