package com.srikrishna.astrotracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import com.srikrishna.astrotracker.model.Event;
import com.srikrishna.astrotracker.service.EventService;
import com.srikrishna.astrotracker.service.ExternalEventService;

import java.util.List;
import java.util.Map;
import java.util.HashMap;


@RestController
@RequestMapping("/api/events")
@CrossOrigin("*")
public class EventController {

    @Autowired
    private EventService service;

    @Autowired
    private ExternalEventService externalEventService;

    // ==============================
    // Internal CRUD (MongoDB)
    // ==============================

    @GetMapping
    public Page<Event> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "eventDate") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        return service.getAllEvents(page, size, sortBy, direction);
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return service.createEvent(event);
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable String id) {
        service.deleteEvent(id);
    }

    @GetMapping("/type/{type}")
    public List<Event> getByType(@PathVariable String type) {
        return service.getEventsByType(type);
    }

    @GetMapping("/upcoming")
    public List<Event> getUpcomingEvents() {
        return service.getUpcomingEvents();
    }

    // ==============================
    // External APIs
    // ==============================

    @GetMapping("/external/launches")
    public String getUpcomingLaunches() {
        return externalEventService.fetchUpcomingLaunches();
    }

    @GetMapping("/external/weather")
    public Map<String, String> getAllWeather() {

        Map<String, String> weatherData = new HashMap<>();

        weatherData.put("cme", externalEventService.fetchCME());
        weatherData.put("flr", externalEventService.fetchSolarFlares());
        weatherData.put("gst", externalEventService.fetchGeomagneticStorms());
        weatherData.put("sep", externalEventService.fetchSEP());

        return weatherData;
    }


    @GetMapping("/external/neo")
    public String getNeoFeed() {
        return externalEventService.fetchNeoFeed();
    }

    @GetMapping("/external/solar-system")
    public String getSolarSystem() {
        return externalEventService.fetchSolarSystemData();
    }
}
