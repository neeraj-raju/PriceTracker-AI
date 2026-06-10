package com.pricetracker.backend.controller;

import com.pricetracker.backend.dto.ComparisonGroupDTO;
import com.pricetracker.backend.dto.ComparisonResultDTO;
import com.pricetracker.backend.dto.CreateComparisonGroupRequest;
import com.pricetracker.backend.model.User;
import com.pricetracker.backend.repository.UserRepository;
import com.pricetracker.backend.service.ComparisonGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/comparison/groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ComparisonController {

    private final ComparisonGroupService comparisonGroupService;
    private final UserRepository userRepository;

    @PostMapping
    public ComparisonGroupDTO createGroup(
            @RequestBody CreateComparisonGroupRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return comparisonGroupService.createGroup(user.getId(), request.getGroupName(), request.getProductUrls());
    }

    @GetMapping
    public List<ComparisonGroupDTO> getGroups(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return comparisonGroupService.getGroups(user.getId());
    }

    @GetMapping("/{groupId}")
    public ComparisonResultDTO getGroupComparison(
            @PathVariable String groupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return comparisonGroupService.getGroupComparison(groupId, user.getId());
    }

    @PostMapping("/{groupId}/refresh")
    public ComparisonResultDTO refreshGroupPrices(
            @PathVariable String groupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return comparisonGroupService.refreshGroupPrices(groupId, user.getId());
    }

    @DeleteMapping("/{groupId}")
    public void deleteGroup(
            @PathVariable String groupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        comparisonGroupService.deleteGroup(groupId, user.getId());
    }
}
