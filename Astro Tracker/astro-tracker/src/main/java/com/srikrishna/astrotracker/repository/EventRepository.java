package com.srikrishna.astrotracker.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.srikrishna.astrotracker.model.Event;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {

    List<Event> findByType(String type);

    List<Event> findByEventDateAfter(LocalDate date);
}
