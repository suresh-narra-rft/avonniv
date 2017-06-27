package com.avonniv.web.rest;

import com.avonniv.repository.UserRepository;
import com.avonniv.service.GrantService;
import com.avonniv.service.MailService;
import com.avonniv.service.dto.GrantDTO;
import com.avonniv.web.rest.util.PaginationUtil;
import com.codahale.metrics.annotation.Timed;
import io.swagger.annotations.ApiParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/grant")
public class GrantResource {

    private final Logger log = LoggerFactory.getLogger(GrantResource.class);

    private static final String ENTITY_NAME = "userManagement";

    private final UserRepository userRepository;

    private final MailService mailService;

    private final GrantService grantService;

    public GrantResource(UserRepository userRepository, MailService mailService,
                         GrantService grantService) {

        this.userRepository = userRepository;
        this.mailService = mailService;
        this.grantService = grantService;
    }

    @GetMapping("")
    @Timed
    public ResponseEntity<List<GrantDTO>> getAllGrant(@ApiParam Pageable pageable) {
        final Page<GrantDTO> page = grantService.getAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/grant");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }
}