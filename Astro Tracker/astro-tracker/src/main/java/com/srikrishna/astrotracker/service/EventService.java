package com.srikrishna.astrotracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.*;

import com.srikrishna.astrotracker.model.Event;
import com.srikrishna.astrotracker.repository.EventRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository repository;

    // Pagination + Sorting
    public Page<Event> getAllEvents(int page, int size, String sortBy, String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return repository.findAll(pageable);
    }

    public Event createEvent(Event event) {
        return repository.save(event);
    }

    public void deleteEvent(String id) {
        repository.deleteById(id);
    }

    public List<Event> getEventsByType(String type) {
        return repository.findByType(type);
    }

    public List<Event> getUpcomingEvents() {
        return repository.findByEventDateAfter(LocalDate.now());
    }
}
