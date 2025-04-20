package com.eazybytes.stocktrading.model;

public class StockDTO {
    private String symbol;
    private String name;
    private double price;
    private double prevClose;
    private double change;

    public StockDTO(Stock stock){
        this.symbol = stock.getSymbol();
        this.name = stock.getName();
        this.price = stock.getCurrentPrice();
        this.prevClose = stock.getPrevClose();
        this.change = this.price - this.prevClose;
    }

    public String getSymbol() {
        return symbol;
    }

    public double getPrice() {
        return price;
    }

    public String getName() {
        return name;
    }

    public double getPrevClose() {
        return prevClose;
    }

    public double getChange() {
        return change;
    }
}
