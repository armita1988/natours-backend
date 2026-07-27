# Trailora Development Seed Data

This folder contains copyright-conscious synthetic demo data for Trailora.

## Counts

- Tours: 20
- Users: 36
- Reviews: 140
- Bookings: 100
- Tour images: 80 — each tour has 1 cover + 3 gallery images
- User images: 37

## Shared demo password

All seed users use this plaintext password in `users.json`:

```txt
Trailora123!
```

Use the included import script with `Model.create()` so the User model save middleware hashes passwords correctly.
Avoid importing users with `insertMany()` unless you pre-hash the passwords yourself.

## Expected asset locations in your project

Copy images to paths matching your app setup, commonly:

```txt
public/img/tours/
public/img/users/
```

JSON data is in:

```txt
data/users.json
data/tours.json
data/reviews.json
data/bookings.json
```

## Import order

1. Users
2. Tours
3. Bookings
4. Reviews

The IDs are fixed MongoDB ObjectId strings, so references are already connected.
See `data/RELATIONSHIP_CHECK.json` for a quick relationship validation summary.
