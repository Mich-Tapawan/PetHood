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
It is an application that takes the location (e.g., City, Province, Region) entered by the user and queries it to the Nominatim API. This API then sends back a JSON file containing a list of objects representing the pet shops, pet schools, grooming services, and veterinary clinics in the Philippines, specifically in the scope of the searched area. Each object includes the establishment's name, address, and longitude and latitude coordinates. In the front end, the objects are displayed as cards that can be clicked to view their map location through LeafletJS and Open Street Map API. Pointers are also placed on the map for every object's coordinates, showing all the resulting locations in a nationwide view. If a card is clicked, the longitude and latitude of the corresponding object are handled by the LeafletJS library which directs and zooms the map view to the specific coordinates, showing the user where the establishment is located.

This application integrates a bookmarking feature by using an SQL database system to store data and a REST API that recognizes each device as a user through generating a unique ID and saving it in the browser's local storage. Upon opening the search page, a request is fetched to the REST API which then checks if the user ID in your local storage matches with any of the existing user IDs in the database. Resulting in none will create a new record with your unique ID in the user table while resulting in a match will just update your 'latest logged-in date' attribute. This ensures that if a user becomes inactive for a certain amount of time, that record will be deleted automatically to avoid insufficient memory storage due to the usage of a limited and free database service.

The bookmarking feature is triggered by clicking the favorites button which sends a post request to the back end using the user's unique ID, selecting and serving all records from the favorites table in the database matching that user_id attribute. The REST API sends back a JSON file containing the list of locations and their details (name, address, longitude, latitude) to the front end which is then displayed in the bookmark section as cards that behave the same as from a searched query use case. A user can add or remove bookmarked items by clicking the bookmark icon at the upper right corner of each card. This makes a fetch request to the back end, selecting items with the specified user_id and shop_name attribute which depending on the icon's current state (bookmarked or not bookmarked), will either remove or add the location in the favorites table of the database, as well as its corresponding card in the bookmark section.

Note: Temporarily disabled the bookmarking feature due to database service expiration.
