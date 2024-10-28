# PetHood
A dynamic web application that utilizes REST API and Nominatim OpenStreetMap external API to locate and bookmark pet care services all around the Philippines.

**Features**
----
- Search pet service locations
- Bookmark locations
- Mobile Responsive

**Tech Stack**
----
Frontend: HTML, Bootstrap 5, Javascript, LeafletJS

Backend: Express JS, MySQL

Hosting Services: Vercel Client-side, Render Server-side

**How it works**
----
It is an application that takes the location (e.g., City, Province, Region) entered by the user and queries it to the Nominatim API. This API then sends back a JSON file containing a list of objects representing the pet shops, pet schools, grooming services, and veterinary clinics in the Philippines, specifically in the scope of the searched area. Each object includes the establishment's name, address, and longitude and latitude coordinates. In the front end, the objects are displayed as cards that can be clicked to view their map location through LeafletJS and Open Street Map API. The longitude and latitude of the clicked card are handled by the LeafletJS library which directs the map view to the specific coordinates, showing the users where the establishment is located.
