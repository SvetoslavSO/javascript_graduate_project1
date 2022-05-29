import { formTemplate } from "./forms";


function mapInit() {
  ymaps.ready(() => {
    let myMap = new ymaps.Map('map', {
      center: [55.76, 37.65],
      zoom: 11
    })

    checkStorage(myMap);

    myMap.events.add('click', function (e) {
      var coords = e.get('coords');
      openBalloon(myMap, coords);
    })
  })
}
function getOptionsCluster(coords) {
  const clusterObjects = [];
  for (const review of getReviewsFromLS()) {
    if (JSON.stringify(review.coords) === JSON.stringify(coords)) {
      const geoObj = new ymaps.GeoObject({
        geometry: { type: 'Point', coordinates: coords }
      })
      clusterObjects.push(geoObj)
    }

  }

  return clusterObjects;
}

function checkStorage(myMap) {
  for (const comment of getReviewsFromLS()) {
    addCluster(myMap, comment.coords);
  }
}

function getReviewsFromLS() {
  return JSON.parse(localStorage.getItem('comments')) || [];
}

function addCluster(map, coords) {
  const clusterer = new ymaps.Clusterer({ clusterDisableClickZoom: true })
  clusterer.options.set('hasBalloon', false)

  function addToCluster() {
    const myGeoObjects = getOptionsCluster(coords)
    clusterer.add(myGeoObjects)
    map.geoObjects.add(clusterer)
    map.balloon.close()
  }

  clusterer.events.add('click', function (e) {
    e.preventDefault();
    openBalloon(map, coords, clusterer, addToCluster)
  })

  addToCluster();
}

function getReviewlist(coords) {
  let reviewListHTML = ''

  for (const review of getReviewsFromLS()) {
    if (JSON.stringify(review.coords) === JSON.stringify(coords)) {
      reviewListHTML +=
          `
            <div class="review">
              <div><strong>Место:</strong>${review.place}</div>
              <div><strong>Имя:</strong>${review.author}</div>
              <div><strong>Отзыв:</strong>${review.review}</div>
            </div>
          `
    }
  }
  return reviewListHTML
}

async function openBalloon(map, coords, clusterer, fn) {
  await map.balloon.open(coords, {
    content: `<div class="reviews">${getReviewlist(coords)}</div>${formTemplate}`
  })

  document.querySelector('#add-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (clusterer) {
      clusterer.removeAll()
    }

    const review = {
      coords: coords,
      author: this.elements.author.value,
      place: this.elements.place.value,
      review: this.elements.review.value
    }

    localStorage.setItem('comments', JSON.stringify([...getReviewsFromLS(), review]));


    !fn ? addCluster(map, coords) : fn()
    map.balloon.close()
  })
}






export {
  mapInit
}