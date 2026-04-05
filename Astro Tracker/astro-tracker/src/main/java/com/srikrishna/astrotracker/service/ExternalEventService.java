package com.srikrishna.astrotracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Service
public class ExternalEventService {

    private final RestTemplate restTemplate;

    public ExternalEventService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // ==============================
    // API KEYS (from application.properties)
    // ==============================

    @Value("${nasa.api.key}")
    private String nasaApiKey;
    // ==============================
    // 1️⃣ SPACE DEVS - Launch Library
    // ==============================

    private final String SPACE_DEVS_API =
            "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=6";

    public String fetchUpcomingLaunches() {
        return restTemplate.getForObject(SPACE_DEVS_API, String.class);
    }

    // ==============================
    // 2️⃣ NASA DONKI (Space Weather)
    // ==============================

    public String fetchCME() {
        String url = "https://api.nasa.gov/DONKI/CME?api_key=" + nasaApiKey;
        return restTemplate.getForObject(url, String.class);
    }

    public String fetchSolarFlares() {
        String url = "https://api.nasa.gov/DONKI/FLR?api_key=" + nasaApiKey;
        return restTemplate.getForObject(url, String.class);
    }

    public String fetchGeomagneticStorms() {
        String url = "https://api.nasa.gov/DONKI/GST?api_key=" + nasaApiKey;
        return restTemplate.getForObject(url, String.class);
    }

    public String fetchSEP() {
        String url = "https://api.nasa.gov/DONKI/SEP?api_key=" + nasaApiKey;
        return restTemplate.getForObject(url, String.class);
    }
    // ==============================
    // 3️⃣ NASA NEO (Asteroids)
    // ==============================

    public String fetchNeoFeed() {
        String url = "https://api.nasa.gov/neo/rest/v1/feed?api_key=" + nasaApiKey;
        return restTemplate.getForObject(url, String.class);
    }
    @Value("${solar.api.key}")
    private String solarApiKey;

    public String fetchSolarSystemData() {

        String url = "https://api.le-systeme-solaire.net/rest/bodies/?filter[]=isPlanet,eq,true";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + solarApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        return restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
        ).getBody();
    }

}
