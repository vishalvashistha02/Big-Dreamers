package com.bigdreamers.backend.repository;

import com.bigdreamers.backend.entity.WholesalerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WholesalerProfileRepository extends JpaRepository<WholesalerProfile, Long> {
}
