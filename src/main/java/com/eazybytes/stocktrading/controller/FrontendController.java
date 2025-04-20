package com.eazybytes.stocktrading.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
@Controller
public class FrontendController {
    @GetMapping(value = {
            "/",
            "/login",
            "/register",
            "/dashboard",
            "/portfolio",
            "/trade",
            "/index",
            "/watchlist",
            "/{path:[^\\.]*}"  // Catch all other frontend routes
    })
    public String forward() {
        return "forward:/index.html";
    }
}