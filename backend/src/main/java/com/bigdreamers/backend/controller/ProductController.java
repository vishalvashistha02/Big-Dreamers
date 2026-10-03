package com.bigdreamers.backend.controller;

import com.bigdreamers.backend.entity.Product;
import com.bigdreamers.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    public static String UPLOAD_DIRECTORY = System.getProperty("user.dir") + "/uploads";

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/active")
    public List<Product> getActiveProducts() {
        return productService.getActiveProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product != null) return ResponseEntity.ok(product);
        return ResponseEntity.notFound().build();
    }

    @PostMapping(consumes = {"application/json"})
    public ResponseEntity<Product> createProductJson(@RequestBody Product product) {
        if (product.getStatus() == null) {
            product.setStatus("Active");
        }
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public Product createProduct(
            @RequestParam("productName") String productName,
            @RequestParam("sku") String sku,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("purchasePrice") BigDecimal purchasePrice,
            @RequestParam("wholesalePrice") BigDecimal wholesalePrice,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("unit") String unit,
            @RequestParam("status") String status,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        Product product = new Product();
        product.setProductName(productName);
        product.setSku(sku);
        product.setCategory(category);
        product.setDescription(description);
        product.setPurchasePrice(purchasePrice);
        product.setWholesalePrice(wholesalePrice);
        product.setStockQuantity(stockQuantity);
        product.setUnit(unit);
        product.setStatus(status);

        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path fileNameAndPath = Paths.get(UPLOAD_DIRECTORY, fileName);
            Files.createDirectories(fileNameAndPath.getParent());
            Files.write(fileNameAndPath, image.getBytes());
            product.setImageUrl("/uploads/" + fileName);
        }
        return productService.saveProduct(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestParam("productName") String productName,
            @RequestParam("sku") String sku,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("purchasePrice") BigDecimal purchasePrice,
            @RequestParam("wholesalePrice") BigDecimal wholesalePrice,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("unit") String unit,
            @RequestParam("status") String status,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        Product product = productService.getProductById(id);
        if (product == null) return ResponseEntity.notFound().build();

        product.setProductName(productName);
        product.setSku(sku);
        product.setCategory(category);
        product.setDescription(description);
        product.setPurchasePrice(purchasePrice);
        product.setWholesalePrice(wholesalePrice);
        product.setStockQuantity(stockQuantity);
        product.setUnit(unit);
        product.setStatus(status);

        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path fileNameAndPath = Paths.get(UPLOAD_DIRECTORY, fileName);
            Files.createDirectories(fileNameAndPath.getParent());
            Files.write(fileNameAndPath, image.getBytes());
            product.setImageUrl("/uploads/" + fileName);
        }
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
}
