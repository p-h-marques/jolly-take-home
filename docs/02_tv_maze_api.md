# TV Maze Api Docs

Excerpts extracted from https://www.tvmaze.com/api relevant to the endpoints cited in the assignment ([01_objective.md](01_objective.md)).

## Rate limiting

> API calls are rate limited to allow at least 20 calls every 10 seconds per IP address.

Exceeding the limit may result in `HTTP 429` responses.

## 1. Show Index — `GET /shows?page=`

> A list of all shows in our database, with all primary information included.

Allows building a local cache of all TVMaze shows. Results are paginated, with a maximum of 250 shows per page, ordered by ID.

> Page 0 will contain shows with IDs between 0 and 250.

**Example URLs:**
- `https://api.tvmaze.com/shows`
- `https://api.tvmaze.com/shows?page=1`

**Example response** (`GET https://api.tvmaze.com/shows?page=0`):

```json
[
  {
    "id": 1,
    "url": "https://www.tvmaze.com/shows/1/under-the-dome",
    "name": "Under the Dome",
    "type": "Scripted",
    "language": "English",
    "genres": ["Drama", "Science-Fiction", "Thriller"],
    "status": "Ended",
    "runtime": 60,
    "averageRuntime": 60,
    "premiered": "2013-06-24",
    "ended": "2015-09-10",
    "officialSite": "http://www.cbs.com/shows/under-the-dome/",
    "schedule": { "time": "22:00", "days": ["Thursday"] },
    "rating": { "average": 6.6 },
    "weight": 99,
    "network": {
      "id": 2,
      "name": "CBS",
      "country": { "name": "United States", "code": "US", "timezone": "America/New_York" },
      "officialSite": "https://www.cbs.com/"
    },
    "webChannel": null,
    "dvdCountry": null,
    "externals": { "tvrage": 25988, "thetvdb": 264492, "imdb": "tt1553656" },
    "image": {
      "medium": "https://static.tvmaze.com/uploads/images/medium_portrait/610/1525272.jpg",
      "original": "https://static.tvmaze.com/uploads/images/original_untouched/610/1525272.jpg"
    },
    "summary": "<p><b>Under the Dome</b> is the story of a small town...</p>",
    "updated": 1769177765,
    "_links": {
      "self": { "href": "https://api.tvmaze.com/shows/1" },
      "previousepisode": { "href": "https://api.tvmaze.com/episodes/185054", "name": "The Enemy Within" }
    }
  }
]
```

`status` is the field used for the filter requested in the assignment (Running / Ended / To Be Determined).

## 2. Show Search — `GET /search/shows?q=`

> Search through all the shows in our database by the show's name. ... uses a fuzzy matching algorithm ... Results are returned in order of relevancy (best matches on top).

**Example URL:**
- `https://api.tvmaze.com/search/shows?q=girls`

**Example response** (`GET https://api.tvmaze.com/search/shows?q=girls`):

```json
[
  {
    "score": 0.89372385,
    "show": {
      "id": 139,
      "url": "https://www.tvmaze.com/shows/139/girls",
      "name": "Girls",
      "type": "Scripted",
      "language": "English",
      "genres": ["Drama", "Romance"],
      "status": "Ended",
      "runtime": 30,
      "averageRuntime": 30,
      "premiered": "2012-04-15",
      "ended": "2017-04-16",
      "officialSite": "http://www.hbo.com/girls",
      "schedule": { "time": "22:00", "days": ["Sunday"] },
      "rating": { "average": 6.5 },
      "weight": 98,
      "network": {
        "id": 8,
        "name": "HBO",
        "country": { "name": "United States", "code": "US", "timezone": "America/New_York" },
        "officialSite": "https://www.hbo.com/"
      },
      "webChannel": null,
      "dvdCountry": null,
      "externals": { "tvrage": 30124, "thetvdb": 220411, "imdb": "tt1723816" },
      "image": {
        "medium": "https://static.tvmaze.com/uploads/images/medium_portrait/31/78286.jpg",
        "original": "https://static.tvmaze.com/uploads/images/original_untouched/31/78286.jpg"
      },
      "summary": "<p>This Emmy winning series is a comic look at the assorted humiliations and rare triumphs of a group of girls in their 20s.</p>",
      "updated": 1704794122,
      "_links": {
        "self": { "href": "https://api.tvmaze.com/shows/139" },
        "previousepisode": { "href": "https://api.tvmaze.com/episodes/1079686", "name": "Latching" }
      }
    }
  }
]
```

> Note from the assignment: the `/shows` and `/search/shows` responses have different shapes — search wraps each show in `{ score, show: {...} }`, while the index returns the show objects directly.

## 3. Episode List — `GET /shows/:id/episodes`

> A complete list of episodes for the given show. Episodes are returned in their airing order, and include full episode information.

Specials are excluded by default.

**Example URLs:**
- `https://api.tvmaze.com/shows/1/episodes`
- `https://api.tvmaze.com/shows/1/episodes?specials=1`

**Example response** (`GET https://api.tvmaze.com/shows/1/episodes`):

```json
[
  {
    "id": 1,
    "url": "https://www.tvmaze.com/episodes/1/under-the-dome-1x01-pilot",
    "name": "Pilot",
    "season": 1,
    "number": 1,
    "type": "regular",
    "airdate": "2013-06-24",
    "airtime": "22:00",
    "airstamp": "2013-06-25T02:00:00+00:00",
    "runtime": 60,
    "rating": { "average": 7 },
    "image": {
      "medium": "https://static.tvmaze.com/uploads/images/medium_landscape/1/4388.jpg",
      "original": "https://static.tvmaze.com/uploads/images/original_untouched/1/4388.jpg"
    },
    "summary": "<p>When the residents of Chester's Mill find themselves trapped under a massive transparent dome...</p>",
    "_links": {
      "self": { "href": "https://api.tvmaze.com/episodes/1" },
      "show": { "href": "https://api.tvmaze.com/shows/1", "name": "Under the Dome" }
    }
  }
]
```

The `season` and `number` fields are the basis for the grouping of episodes by season mentioned as a bonus in the assignment.
