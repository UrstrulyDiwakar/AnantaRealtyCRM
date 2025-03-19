package com.example.demo;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.chart.*;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import java.util.Arrays;
import java.util.List;

public class TelecallerReportApp extends Application {

    @Override
    public void start(Stage primaryStage) {
        List<TelecallerActivity> activities = Arrays.asList(
            new TelecallerActivity("TC001", "2023-02-06", 10, 35),
            new TelecallerActivity("TC002", "2023-02-06", 8, 28)
            // Add more data as needed
        );

        CategoryAxis xAxis = new CategoryAxis();
        NumberAxis yAxis = new NumberAxis();
        BarChart<String, Number> barChart = new BarChart<>(xAxis, yAxis);
        barChart.setTitle("Weekly Telecaller Activity");

        XYChart.Series<String, Number> series = new XYChart.Series<>();
        series.setName("Number of Calls");
        activities.forEach(a -> series.getData().add(new XYChart.Data<>(a.getDate(), a.getNumberOfCalls())));
        barChart.getData().add(series);

        PieChart pieChart = new PieChart();
    
        activities.forEach(a -> pieChart.getData().add(new PieChart.Data(a.getTelecallerId(), a.getTotalDurationMinutes())));
        pieChart.setTitle("Call Duration Share");

        VBox root = new VBox(barChart, pieChart);
        Scene scene = new Scene(root, 800, 600);

        primaryStage.setTitle("Telecaller Report");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
