import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

type Photo = { image: string; alt: string };

export type GalleryRoom = {
  id: string;
  title: string;
  image: string;
  alt: string;
  description: string;
  gallery: readonly Photo[];
};

function roomFromHash(rooms: readonly GalleryRoom[]) {
  const id = window.location.hash.slice(1);
  return rooms.find((room) => room.id === id) ?? rooms[0];
}

export function RoomGallery({ rooms }: { rooms: readonly GalleryRoom[] }) {
  const [room, setRoom] = useState(() => roomFromHash(rooms));
  const [photoIndex, setPhotoIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const photos = [...room.gallery, { image: room.image, alt: room.alt }];
  const photo = photos[photoIndex];

  useEffect(() => {
    function syncRoom() {
      const nextRoom = roomFromHash(rooms);
      if (nextRoom === room) return;
      setRoom(nextRoom);
      setPhotoIndex(0);
    }

    window.addEventListener('hashchange', syncRoom);
    return () => window.removeEventListener('hashchange', syncRoom);
  }, [room, rooms]);

  function chooseRoom(nextRoom: GalleryRoom) {
    if (nextRoom === room) return;
    history.replaceState(history.state, '', '#' + nextRoom.id);
    setRoom(nextRoom);
    setPhotoIndex(0);
  }

  function stepPhoto(direction: number) {
    setPhotoIndex((index) => (index + direction + photos.length) % photos.length);
  }

  function onPhotoKey(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stepPhoto(event.key === 'ArrowLeft' ? -1 : 1);
  }

  return (
    <section className="room-gallery" aria-labelledby="features-title">
      <button className="room-preview" type="button" aria-label={'Enlarge photo: ' + photo.alt} onClick={() => dialog.current?.showModal()} onKeyDown={onPhotoKey}>
        <img className="room-preview-image" key={photo.image} src={photo.image} alt="" fetchPriority="high" />
        <span className="room-expand" aria-hidden="true"><Expand size={18} /></span>
      </button>

      <div className="room-rail" role="group" aria-label="Choose a room">
        {rooms.map((item) => (
          <button className="room-picker" type="button" key={item.id} aria-pressed={item.id === room.id} onClick={() => chooseRoom(item)}>
            <span className="room-picker-image"><img src={item.image} alt="" /></span>
            <span className="room-picker-label">{item.title}</span>
          </button>
        ))}
      </div>

      <div className="room-details">
        <h1 id="features-title">Explore the spaces</h1>
        <h2>{room.title}</h2>
        <p>{room.description}</p>
      </div>

      <div className="room-photo-bar">
        <span className="room-image-note">Illustrative interiors</span>
        <div className="room-photo-controls" role="group" aria-label={room.title + ' photos'} onKeyDown={onPhotoKey}>
          <button className="room-step" type="button" onClick={() => stepPhoto(-1)} aria-label="Previous photo"><ArrowLeft size={17} /></button>
          <div className="room-thumbs">
            {photos.map((item, index) => (
              <button className="room-thumb" type="button" key={item.image} aria-pressed={index === photoIndex} aria-label={'Show photo ' + (index + 1) + ': ' + item.alt} onClick={() => setPhotoIndex(index)}>
                <img src={item.image} alt="" />
              </button>
            ))}
          </div>
          <button className="room-step" type="button" onClick={() => stepPhoto(1)} aria-label="Next photo"><ArrowRight size={17} /></button>
        </div>
        <span className="sr-only" role="status">{room.title}, photo {photoIndex + 1} of {photos.length}</span>
      </div>

      <dialog className="room-lightbox" ref={dialog} aria-label={room.title + ' photo viewer'} onKeyDown={onPhotoKey} onClick={(event) => {
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
