# Cloudinary Setup and Media Sync

This project now supports Cloudinary as the media source for park images and videos.

## 1. Environment variables

Create a `.env` file in the project root with:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

A sample template is already included in `.env.example`.

## 2. Sync local assets to Cloudinary

Run:

```powershell
node .\scripts\sync-cloudinary.mjs
```

What it does:
- Uploads hero video from `assets/videos/uganda-safari-hero.mp4`.
- Uploads park images/videos from:
  - `assets/bwindi`
  - `assets/queen_elizabeth`
  - `assets/murchison_falls`
  - `assets/kidepoWild`
  - `assets/lake_bunyonyi`
  - `assets/rwenzori`
  - `assets/lake_mburo`
- Generates/updates `js/cloudinary-media.json`.

## 3. Frontend loading flow

Pages now load data in this order:
1. `js/data.json`
2. `js/cloudinary-media.json`
3. Merge Cloudinary media into matching attraction IDs

If `cloudinary-media.json` is missing, pages fall back to `data.json` values.

## 4. Optimization built-in

Cloudinary delivery optimization is applied at runtime for image-heavy sections:
- `f_auto`
- `q_auto`
- `dpr_auto`
- Contextual width/crop based on section

## 5. When you add new media files

1. Put files under the correct park folder in `assets/`.
2. Re-run:

```powershell
node .\scripts\sync-cloudinary.mjs
```

3. Refresh the site.
