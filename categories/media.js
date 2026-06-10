/**
 * media.js
 * ------------------------------------------------------------
 * Shared Cloudinary media utilities for all pages.
 */
(function () {
  const MANIFEST_PATH = './js/cloudinary-media.json';

  function isCloudinaryUrl(url) {
    return typeof url === 'string' && url.includes('res.cloudinary.com');
  }

  function getOptimizedUrl(url, options = {}) {
    if (!isCloudinaryUrl(url)) return url;

    const {
      width,
      height,
      crop = 'limit',
      gravity = 'auto',
      quality = 'auto',
      format = 'auto',
      dpr = 'auto',
    } = options;

    const transforms = [`f_${format}`, `q_${quality}`, `dpr_${dpr}`];

    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (width || height) {
      transforms.push(`c_${crop}`);
      if (crop !== 'scale' && crop !== 'fit') transforms.push(`g_${gravity}`);
    }

    const marker = '/upload/';
    const idx = url.indexOf(marker);
    if (idx === -1) return url;

    return `${url.slice(0, idx + marker.length)}${transforms.join(',')}/${url.slice(idx + marker.length)}`;
  }

  function buildGalleryMedia(attraction) {
    const gallery = [];

    if (Array.isArray(attraction.images)) {
      for (const image of attraction.images) {
        gallery.push({ type: 'image', src: image });
      }
    }

    if (Array.isArray(attraction.videos)) {
      for (const video of attraction.videos) {
        gallery.push({ type: 'video', src: video });
      }
    }

    return gallery;
  }

  function applyAttractionMedia(data, manifest) {
    if (!data?.attractions || !manifest?.parks) return data;

    data.attractions = data.attractions.map((attraction) => {
      const park = manifest.parks[attraction.id];
      if (!park) {
        attraction.galleryMedia = buildGalleryMedia(attraction);
        return attraction;
      }

      const hasImages = Array.isArray(park.images) && park.images.length > 0;
      const hasVideos = Array.isArray(park.videos) && park.videos.length > 0;

      if (hasImages) {
        attraction.images = [...park.images];
        attraction.heroImage = park.coverImage || park.images[0];
      }

      if (hasVideos) {
        attraction.videos = [...park.videos];
        attraction.video = park.videos[0];
      }

      attraction.galleryMedia = buildGalleryMedia(attraction);
      return attraction;
    });

    return data;
  }

  async function loadCloudinaryManifest() {
    try {
      const res = await fetch(MANIFEST_PATH, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.warn('Cloudinary manifest unavailable, falling back to default media.', error);
      return null;
    }
  }

  async function loadDataWithCloudinary(dataPath = './js/data.json') {
    const [dataResponse, manifest] = await Promise.all([
      fetch(dataPath, { cache: 'no-store' }),
      loadCloudinaryManifest(),
    ]);

    if (!dataResponse.ok) throw new Error(`HTTP ${dataResponse.status}`);

    const data = await dataResponse.json();
    const merged = applyAttractionMedia(data, manifest);

    return { data: merged, manifest };
  }

  function applyHeroVideoFromManifest(manifest) {
    if (!manifest?.heroVideo) return;

    const source = document.getElementById('hero-video-source');
    const video = document.getElementById('hero-video');

    if (!source || !video) return;

    source.src = manifest.heroVideo;
    video.load();
  }

  window.CloudinaryMedia = {
    getOptimizedUrl,
    loadDataWithCloudinary,
    loadCloudinaryManifest,
    applyHeroVideoFromManifest,
  };
})();
