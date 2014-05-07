 require([
         "esri/config",
         "esri/arcgis/utils",
         "esri/map",
         "esri/geometry/Extent",
         "esri/layers/WebTiledLayer",
         "dojo/dom",
         "dojo/on",
         "./js/bootstrapmap.js",
         "./js/OAuthHelper.js",
         "./config/defaults.js",
         "./js/aws-search.js",
         "dojo/domReady!",
         "esri/IdentityManager"
     ],
     function(esriConfig, arcgisUtils, Map, Extent, WebTiledLayer, dom, on, BootstrapMap, OAuthHelper, config, Search) {
         var map = null;
         var operationalLayers = null;
         var bookmarks = null;
         var swipeWidget = null;
         var currentSelection = null;
         var switchBoard = null;
         var basemap = "MapBox Space";
         var webmap = null;

         var setupOAuth = function(id, portal) {
             OAuthHelper.init({
                 appId: id,
                 portal: portal,
                 expiration: (14 * 24 * 60) //2 weeks (in minutes)
             });
         };

         var urlObject = esri.urlToObject(document.location.href);
         if (urlObject.query !== null && urlObject.query.webmap !== null) {
             webmap = urlObject.query.webmap;
         } else {
             webmap = config.webmap;
         }
         if (config.oauthappid) {
             setupOAuth(config.oauthappid, config.sharinghost);
         }

         var deferred = arcgisUtils.createMap(webmap, "map").then(function(response) {

             map = response.map;
             operationalLayers = response.itemInfo.itemData.operationalLayers;
             bookmarks = response.itemInfo.itemData.bookmarks;

             $("#title").text(response.itemInfo.item.title);
             $("#subtitle").text(response.itemInfo.item.snippet);
             $("#email").attr('href', 'mailto:' + response.itemInfo.item.accessInformation);

             if (bookmarks) {
                 var bookmarkList = [];
                 $.each(bookmarks, function(i, item) {
                     bookmarkList.push('<li><a id="' + i + '" href="#">' + item.name + '</a></li>');
                 });
                 $('#bookmarks').append(bookmarkList.join(''));
                 $('#bookmarks').click(function(event) {
                     console.log(event.target.id);
                     console.log(bookmarks[event.target.id]);
                     setExtent(bookmarks[event.target.id].extent);
                 });
             }
         });
         var removeLayers = function(list) {
             $.each(list, function(i, layerInfo) {
                 map.removeLayer(layerInfo.layerObject);
             });
         }

         var setExtent = function(object) {
             var extent = new Extent(object);
             map.setExtent(extent, true);
             console.log('zoomlevel: ' + map.getZoom());
         }
         var zoomTo = function(point) {
             map.centerAndZoom(point, 17);
         }

         var switchToBasemap = function(name) {
             basemap = name;
             var l, options;
             switch (name) {
                 case "Water Color":
                     options = {
                         id: 'Water Color',
                         copyright: 'stamen',
                         resampling: true,
                         subDomains: ['a', 'b', 'c', 'd']
                     };
                     l = new WebTiledLayer('http://${subDomain}.tile.stamen.com/watercolor/${level}/${col}/${row}.jpg', options);
                     map.addLayer(l);
                     break;

                 case "MapBox Space":
                     options = {
                         id: 'mapbox-space',
                         copyright: 'MapBox',
                         resampling: true,
                         subDomains: ['a', 'b', 'c', 'd']
                     };
                     l = new WebTiledLayer('http://${subDomain}.tiles.mapbox.com/v3/eleanor.ipncow29/${level}/${col}/${row}.jpg', options);
                     map.addLayer(l);
                     break;

                 case "Pinterest":
                     options = {
                         id: 'mapbox-pinterest',
                         copyright: 'Pinterest/MapBox',
                         resampling: true,
                         subDomains: ['a', 'b', 'c', 'd']
                     };
                     l = new WebTiledLayer('http://${subDomain}.tiles.mapbox.com/v3/pinterest.map-ho21rkos/${level}/${col}/${row}.jpg', options);
                     map.addLayer(l);
                     break;
                 case "Streets":
                     map.setBasemap("streets");
                     break;
                 case "Imagery":
                     map.setBasemap("hybrid");
                     break;
                 case "National Geographic":
                     map.setBasemap("national-geographic");
                     break;
                 case "Topographic":
                     map.setBasemap("topo");
                     break;
                 case "Gray":
                     map.setBasemap("gray");
                     break;
                 case "Open Street Map":
                     map.setBasemap("osm");
                     break;
             }
         }

         $(document).ready(function() {
             $("#basemapList li").click(function(e) {
                 map.removeAllLayers();
                 switchToBasemap(e.target.text);
             });
             // do some searching
             var search = Search.create('.typeahead', setExtent, zoomTo);
         });

     });
