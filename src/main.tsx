import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, CarFront, Check, CookingPot, Facebook, Instagram, Menu, MessageCircle, Phone, Snowflake, Sparkles, Wifi, X, Zap } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { ActionButton } from './ActionButton';
import { RoomGallery, type GalleryRoom } from './RoomGallery';
import './styles.css';

const pages = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/contact', label: 'Contact' },
] as const;

const spaces: GalleryRoom[] = [
  {
    id: 'living', title: 'Living room', image: '/images/living.jpg',
    alt: 'Cognac leather seating and warm wood in an apartment living room',
    description: 'A place to settle in after a day out.',
    gallery: [
      { image: '/images/living-view-1.jpg', alt: 'Wide view of the leather sofa and oak coffee table' },
      { image: '/images/living-view-2.jpg', alt: 'Living room from the opposite side of the sofa' },
    ],
  },
  {
    id: 'bedroom', title: 'Bedroom', image: '/images/bedroom.jpg',
    alt: 'A neatly made bed with soft linens and warm bedside lighting',
    description: 'Soft linens and warm light for a slower morning.',
    gallery: [
      { image: '/images/bedroom-view-1.jpg', alt: 'Bedroom with a walnut headboard and rust-colored throw' },
      { image: '/images/bedroom-view-2.jpg', alt: 'Bedroom view from the foot of the bed' },
    ],
  },
  {
    id: 'kitchen', title: 'Kitchen', image: '/images/kitchen.jpg',
    alt: 'A slate-toned kitchen with timber details and pendant lighting',
    description: 'Space to make coffee, cook, and eat at your own pace.',
    gallery: [
      { image: '/images/kitchen-view-1.jpg', alt: 'Kitchen island beneath brass pendant lights' },
      { image: '/images/kitchen-view-2.jpg', alt: 'Kitchen view along the worktop and windows' },
    ],
  },
];

const featureSpaces: GalleryRoom[] = [
  ...spaces,
  {
    id: 'dining', title: 'Dining room', image: '/images/dining-view-2.jpg',
    alt: 'Dining table and cognac chairs seen from the window side',
    description: 'A table for breakfast, dinner, or a quiet coffee.',
    gallery: [{ image: '/images/dining-view-1.jpg', alt: 'Oak dining table beneath a linen pendant' }],
  },
  {
    id: 'bathroom', title: 'Bathroom', image: '/images/bathroom-view-2.jpg',
    alt: 'Warm limestone bathroom with a walnut vanity',
    description: 'Warm stone, soft lighting, and a walk-in shower.',
    gallery: [{ image: '/images/bathroom-view-1.jpg', alt: 'Glass shower and brushed brass fixtures' }],
  },
  {
    id: 'balcony', title: 'Balcony', image: '/images/balcony-view-2.jpg',
    alt: 'Iron balcony railing overlooking leafy streets',
    description: 'A spot for fresh air and a view over the treetops.',
    gallery: [{ image: '/images/balcony-view-1.jpg', alt: 'Cane chairs and planters on a city balcony' }],
  },
];

const services = [
  { label: 'Wi-Fi', icon: Wifi },
  { label: '24/7 Power', icon: Zap },
  { label: 'Air Conditioning', icon: Snowflake },
  { label: 'Fitted Kitchen', icon: CookingPot },
  { label: 'Housekeeping', icon: Sparkles },
  { label: 'Secure Parking', icon: CarFront },
];

const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

function Wordmark() {
  return <a className="wordmark" href="/" aria-label="Bash Homes home">bash<span>.</span><small>HOMES</small></a>;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    }}>
      <Wordmark />
      <button ref={menuButton} type="button" className="menu-button" aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <nav id="primary-navigation" className={menuOpen ? 'primary-nav is-open' : 'primary-nav'} aria-label="Main navigation">
        {pages.filter(({ href }) => href !== '/contact').map(({ href, label }) => <a key={href} href={href} aria-current={currentPath === href ? 'page' : undefined}>{label}</a>)}
        <ActionButton className="header-cta" href="/contact">Inquire <ArrowUpRight size={14} aria-hidden="true" /></ActionButton>
      </nav>
    </header>
  );
}

function Services() {
  return (
    <section className="services" id="services" aria-labelledby="services-title">
      <div className="services-heading">
        <h2 id="services-title">Services &amp; amenities</h2>
        <p>Ask us what’s available for your stay.</p>
      </div>
      <ul className="services-list">
        {services.map(({ icon: Icon, label }) => (
          <li key={label}><span className="service-icon"><Icon strokeWidth={1.4} size={26} aria-hidden="true" /></span><span>{label}</span></li>
        ))}
      </ul>
    </section>
  );
}

function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="home-title">
        <Header />
        <div className="hero-copy">
          <p className="eyebrow">Short-let apartments</p>
          <h1 id="home-title" tabIndex={-1}>Make yourself<br /><em>at home.</em></h1>
          <p className="hero-description">Furnished apartments for a few nights or a little longer.</p>
          <ActionButton href="/contact">Inquire about a stay <ArrowRight size={17} aria-hidden="true" /></ActionButton>
          <a className="scroll-link" href="#services" aria-label="Explore services and amenities"><ArrowDown size={17} aria-hidden="true" /></a>
        </div>
        <div className="hero-gallery">
          {spaces.map(({ id, title, image, alt }, index) => (
            <a className="hero-panel" key={id} href={'/features#' + id}>
              <img src={image} alt={alt} fetchPriority={index === 0 ? 'high' : 'auto'} />
              <span className="panel-label">{title}<ArrowUpRight size={16} aria-hidden="true" /></span>
            </a>
          ))}
          <span className="image-note">Illustrative interiors</span>
        </div>
      </section>
      <Services />
    </>
  );
}

function Features() {
  return (
    <>
      <RoomGallery rooms={featureSpaces} header={<Header />} />
      <section className="stay-details" aria-labelledby="stay-details-title">
        <h2 id="stay-details-title">Before your stay</h2>
        <dl className="stay-details-list">
          <div>
            <dt>Price per night (₦)</dt>
            <dd><strong className="stay-amount">₦100,000</strong> per night<span className="rate-note">Sample rate · Confirm when booking.</span></dd>
          </div>
          <div>
            <dt>Refundable caution deposit</dt>
            <dd><strong className="stay-amount">₦50,000</strong> payable in advance and returned after your stay, subject to deductions for any damages.<span className="rate-note">Sample deposit · Confirm when booking.</span></dd>
          </div>
          <div>
            <dt>Additional charges</dt>
            <dd>Extra services or costs incurred during your stay may be charged separately.</dd>
          </div>
        </dl>
        <ActionButton href="/contact">Inquire about a stay <ArrowRight size={17} aria-hidden="true" /></ActionButton>
      </section>
    </>
  );
}

function Contact() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [notice, setNotice] = useState('');
  const [arrival, setArrival] = useState('');
  const attempt = useRef<{ body: string; id: string } | null>(null);
  const sending = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const body = JSON.stringify(fields);
    if (attempt.current?.body !== body) attempt.current = { body, id: crypto.randomUUID() };
    sending.current = true;
    setState('sending');
    setNotice('');
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, id: attempt.current.id }),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        setNotice(result.message || 'We couldn’t send your inquiry. Please try again.');
        setState('error');
        return;
      }
      form.reset();
      setArrival('');
      attempt.current = null;
      setState('sent');
    } catch {
      setNotice('We couldn’t send your inquiry. Please try again.');
      setState('error');
    } finally {
      sending.current = false;
    }
  }

  return (
    <section className="contact-page" aria-labelledby="contact-title">
      <div className="contact-image">
        <img src="/images/living.jpg" alt="A warmly furnished short-stay apartment living room" />
        <span className="image-note">Illustrative interior</span>
      </div>
      <div className="contact-content">
        <h1 id="contact-title">Plan your stay</h1>
        <p>Send us your dates or ask a question about Bash Homes.</p>
        <div className="contact-direct" aria-label="Phone and social media">
          <div className="contact-phone"><Phone size={18} aria-hidden="true" /><span>+234 XXX XXX XXXX<small>Phone number coming soon</small></span></div>
          <div className="contact-socials" role="group" aria-label="Social profiles coming soon">
            <span className="contact-social" role="img" aria-label="Instagram profile coming soon" title="Instagram profile coming soon"><Instagram size={21} aria-hidden="true" /></span>
            <span className="contact-social" role="img" aria-label="Facebook profile coming soon" title="Facebook profile coming soon"><Facebook size={21} aria-hidden="true" /></span>
            <span className="contact-social" role="img" aria-label="WhatsApp contact coming soon" title="WhatsApp contact coming soon"><MessageCircle size={21} aria-hidden="true" /></span>
          </div>
        </div>
        <form className="contact-form" onSubmit={submit} aria-busy={state === 'sending'}>
          <fieldset disabled={state === 'sending'}>
            <label>Full name<input name="name" autoComplete="name" maxLength={100} required /></label>
            <label>Email<input type="email" name="email" autoComplete="email" maxLength={254} required /></label>
            <label>Phone <span>(optional)</span><input type="tel" name="phone" autoComplete="tel" maxLength={32} /></label>
            <div className="date-fields">
              <label>Check-in <span>(optional)</span><input type="date" name="arrival" value={arrival} onChange={(event) => setArrival(event.currentTarget.value)} /></label>
              <label>Check-out <span>(optional)</span><input type="date" name="departure" min={arrival || undefined} /></label>
            </div>
            <label>Message<textarea name="message" rows={4} maxLength={2000} required /></label>
            <div className="contact-trap" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
            <ActionButton type="submit">{state === 'sending' ? 'Sending…' : 'Send inquiry'}<ArrowDownRight size={17} aria-hidden="true" /></ActionButton>
          </fieldset>
          {state === 'sent' && <p className="form-success" role="status"><Check size={18} aria-hidden="true" /> Thanks. Your inquiry has been received.</p>}
          {state === 'error' && <p className="form-error" role="alert">{notice}</p>}
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} Bash Homes</span>
      <nav aria-label="Footer navigation">
        {pages.map(({ href, label }) => <a key={href} href={href} aria-current={currentPath === href ? 'page' : undefined}>{label}</a>)}
      </nav>
    </footer>
  );
}

const page = pages.find(({ href }) => href === currentPath);
if (page && page.href !== '/') document.title = page.label + ' | Bash Homes';

createRoot(document.getElementById('root')!).render(
  <>
    <a className="skip-link" href={currentPath === '/' ? '#home-title' : currentPath === '/features' ? '#features-title' : '#main'}>Skip to content</a>
    <div className="site-shell">
      {currentPath !== '/' && currentPath !== '/features' && <Header />}
      <main id="main" tabIndex={-1}>
        {currentPath === '/' && <Home />}
        {currentPath === '/features' && <Features />}
        {currentPath === '/contact' && <Contact />}
        {!page && <section className="not-found"><h1>Page not found</h1><ActionButton href="/">Back to home <ArrowRight size={17} aria-hidden="true" /></ActionButton></section>}
      </main>
      <Footer />
    </div>
  </>,
);

if (window.location.hash) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }));
}

