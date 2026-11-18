import { ArrowLeft, ArrowRight, Expand, Pause, Play, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

type Photo = { image: string; alt: string };

export type GalleryRoom = {
  id: string;
  title: string;
  image: string;
  alt: string;
  description: string;
  gallery: readonly Photo[];
};

const PHOTO_DURATION_MS = 5000;

function roomIndexFromHash(rooms: readonly GalleryRoom[]) {
  const id = window.location.hash.slice(1);
  return rooms.findIndex((room) => room.id === id);
}

export function RoomGallery({ rooms, header }: { rooms: readonly GalleryRoom[]; header: ReactNode }) {
  const [selection, setSelection] = useState(() => ({ roomIndex: Math.max(0, roomIndexFromHash(rooms)), photoIndex: 0 }));
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const { roomIndex, photoIndex } = selection;
  const room = rooms[roomIndex];
  const photos = [...room.gallery, { image: room.image, alt: room.alt }];
  const photo = photos[photoIndex];

  useEffect(() => {
    function syncRoom() {
      const index = roomIndexFromHash(rooms);
      if (index !== -1) setSelection({ roomIndex: index, photoIndex: 0 });
    }

    window.addEventListener('hashchange', syncRoom);
    return () => window.removeEventListener('hashchange', syncRoom);
  }, [rooms]);

  useEffect(() => {
    const syncVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  useEffect(() => {
    if (!playing || !tabVisible || lightboxOpen) return;
    const timer = window.setTimeout(() => {
      setSelection((current) => {
        const nextPhoto = current.photoIndex + 1;
        return nextPhoto <= rooms[current.roomIndex].gallery.length
          ? { ...current, photoIndex: nextPhoto }
          : { roomIndex: (current.roomIndex + 1) % rooms.length, photoIndex: 0 };
      });
    }, PHOTO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [playing, tabVisible, lightboxOpen, selection, rooms]);

  useEffect(() => {
    const scroller = rail.current;
    const active = scroller?.querySelector('[aria-pressed="true"]');
    if (!scroller || !active || scroller.scrollWidth <= scroller.clientWidth) return;
    const bounds = scroller.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (item.left < bounds.left) scroller.scrollLeft += item.left - bounds.left;
    if (item.right > bounds.right) scroller.scrollLeft += item.right - bounds.right;
  }, [roomIndex]);

  function chooseRoom(index: number) {
    history.replaceState(history.state, '', '#' + rooms[index].id);
    setSelection({ roomIndex: index, photoIndex: 0 });
  }

  function stepPhoto(direction: number) {
    setSelection((current) => ({
      ...current,
      photoIndex: (current.photoIndex + direction + photos.length) % photos.length,
    }));
  }

  function onPhotoKey(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stepPhoto(event.key === 'ArrowLeft' ? -1 : 1);
  }

  return (
    <section className="room-gallery" aria-labelledby="features-title" onFocus={(event) => {
      if (event.target instanceof HTMLButtonElement && event.target.matches(':focus-visible')) setPlaying(false);
    }}>
      {header}
      <button className="room-preview" type="button" aria-label={'Enlarge photo: ' + photo.alt} onClick={() => {
        dialog.current?.showModal();
        setLightboxOpen(true);
      }} onKeyDown={onPhotoKey}>
        <img className="room-preview-image" key={photo.image} src={photo.image} alt="" fetchPriority="high" />
        <span className="room-expand" aria-hidden="true"><Expand size={18} /></span>
      </button>

      <div className="room-rail-wrap" ref={rail}>
        <div className="room-rail" role="group" aria-label="Choose a room">
          {rooms.map((item, index) => (
            <button className="room-picker" type="button" key={item.id} aria-pressed={index === roomIndex} onClick={() => chooseRoom(index)}>
              <span className="room-picker-image"><img src={item.image} alt="" /></span>
              <span className="room-picker-label">{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="room-details">
        <h1 id="features-title" tabIndex={-1}>Explore the spaces</h1>
        <h2>{room.title}</h2>
        <p>{room.description}</p>
      </div>

      <div className="room-photo-bar">
        <span className="room-image-note">Illustrative interiors</span>
        <div className="room-photo-controls" role="group" aria-label={room.title + ' photos'} onKeyDown={onPhotoKey}>
          <button className="room-step" type="button" onClick={() => setPlaying((active) => !active)} aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className="room-step" type="button" onClick={() => stepPhoto(-1)} aria-label="Previous photo"><ArrowLeft size={17} /></button>
          <div className="room-thumbs">
            {photos.map((item, index) => (
              <button className="room-thumb" type="button" key={item.image} aria-pressed={index === photoIndex} aria-label={'Show photo ' + (index + 1) + ': ' + item.alt} onClick={() => setSelection({ roomIndex, photoIndex: index })}>
                <img src={item.image} alt="" />
              </button>
            ))}
          </div>
          <button className="room-step" type="button" onClick={() => stepPhoto(1)} aria-label="Next photo"><ArrowRight size={17} /></button>
        </div>
        <span className="sr-only" role="status" aria-live={playing ? 'off' : 'polite'}>{room.title}, photo {photoIndex + 1} of {photos.length}</span>
      </div>

      <dialog className="room-lightbox" ref={dialog} aria-label={room.title + ' photo viewer'} onClose={() => setLightboxOpen(false)} onKeyDown={onPhotoKey} onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}>
        <div className="room-lightbox-content">
          <button className="room-step room-lightbox-close" type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Close photo viewer"><X size={22} /></button>
          <img src={photo.image} alt={photo.alt} />
          <div className="room-lightbox-controls">
            <button className="room-step" type="button" onClick={() => stepPhoto(-1)} aria-label="Previous enlarged photo"><ArrowLeft size={19} /></button>
            <span aria-live="polite">{room.title} · {photoIndex + 1} / {photos.length}</span>
            <button className="room-step" type="button" onClick={() => stepPhoto(1)} aria-label="Next enlarged photo"><ArrowRight size={19} /></button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
