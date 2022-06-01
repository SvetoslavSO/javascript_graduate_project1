import { formTemplate } from "./forms";

let clusterer;

function mapInit() {
  ymaps.ready(() => {
    let myMap = new ymaps.Map('map', {
      center: [55.76, 37.65],
      zoom: 11
    })

    clusterer = new ymaps.Clusterer({clusterDisableClickZoom:true});
    clusterer.options.set('hasBalloon', false);

    getGeoObjects(myMap);

    myMap.events.add('click', function (e) {
      var coords = e.get('coords');
      openBalloon(myMap, coords, []);
    });

    clusterer.events.add('click', function(e) {
      let geoObjectsInCluster = e.get('target').getGeoObjects()
      openBalloon(myMap, e.get('coords'), geoObjectsInCluster)
    })
  })
}

function getReviewsFromLS() {
  return JSON.parse(localStorage.getItem('reviews')) || [];
}

function getGeoObjects(map) {
  const geoObjects = []
  for (const review of getReviewsFromLS() || []) {
    const placemark = new ymaps.Placemark(review.coords);
    placemark.events.add('click', e => {
      e.stopPropagation();
      openBalloon(map, e.get('coords'), [e.get('target')])
    })
    geoObjects.push(placemark);
  }

  clusterer.removeAll()
  map.geoObjects.remove(clusterer)
  clusterer.add(geoObjects)
  map.geoObjects.add(clusterer)
}


function getReviewlist(currentGeoObjects) {
  let reviewListHTML = ''

  for (const review of getReviewsFromLS()) {
    if (currentGeoObjects.some(geoObject => JSON.stringify(geoObject.geometry._coordinates) === JSON.stringify(review.coords))) {
      reviewListHTML += `
        <div class="review">
          <div><strong>Место: </strong>${review.place}</div>
          <div><strong>Имя: </strong>${review.author}</div>
          <div><strong>Отзыв: </strong>${review.reviewText}</div>
        </div>  
      `;
    }
  }
  return reviewListHTML
}

async function openBalloon(map, coords, currentGeoObjects) {
  await map.balloon.open(coords, {
    content: `<div class="reviews">${getReviewlist(currentGeoObjects)}</div>${formTemplate}`
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

    localStorage.setItem('reviews', JSON.stringify([...getReviewsFromLS(), review]));

    getGeoObjects(map);
    map.balloon.close()
  })
}






export {
  mapInit
}