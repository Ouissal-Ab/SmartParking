package com.example.Parking;

import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;

public class LoginSeleniumTest {

    private WebDriver driver;

    @BeforeEach
    void setup() {
        driver = new ChromeDriver();  // Selenium auto-downloads ChromeDriver
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
    }

    @AfterEach
    void teardown() {
        if (driver != null) driver.quit();
    }

    @Test
    void loginWithValidCredentials() {
        driver.get("http://localhost:3000/login");
        driver.findElement(By.name("email")).sendKeys("admin@parking.com");
        driver.findElement(By.name("password")).sendKeys("yourPassword");
        driver.findElement(By.cssSelector("button[type='submit']")).click();
        assertTrue(driver.getCurrentUrl().contains("/admin"));
    }
}