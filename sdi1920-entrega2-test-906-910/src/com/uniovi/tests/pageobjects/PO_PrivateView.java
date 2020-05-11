package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;


public class PO_PrivateView extends PO_NavView{
	static public void fillFormAddMark(WebDriver driver, int userOrder, String descriptionp, String scorep)
	{	
		//Espero por que se cargue el formulario de asñadir nota (Concretamente el botón class="btn")
		PO_View.checkElement(driver, "class", "btn");
		//Seleccionamos el alumnos userOrder
	    new Select (driver.findElement(By.id("user"))).selectByIndex(userOrder);
	    //Rellenemos el campo de descripción
	    WebElement description = driver.findElement(By.name("description"));
		description.clear();
		description.sendKeys(descriptionp);
		WebElement score = driver.findElement(By.name("score"));
		score.click();
		score.clear();
		score.sendKeys(scorep);
		By boton = By.className("btn");
		driver.findElement(boton).click();	
	}
	
	public static void clickNextPage(WebDriver driver, String pag) {
		//Pulsamos el boton de siguiente pag
		By boton = By.id("btnNext"+pag);
		driver.findElement(boton).click();
	}
	
	/**
	 * Escribe en la barra de busqueda lo introducido en la variable texto.
	 * @param driver
	 * @param texto
	 */
	public static void writeOnSeeker(WebDriver driver, String texto) {
		//Escribimos lo pasado como parametro dentro del buscador de usuarios
		WebElement userSeeker = driver.findElement(By.name("busqueda"));
		userSeeker.click();
		userSeeker.clear();
		userSeeker.sendKeys(texto);
		//Pulsamos el boton de buscar
		By boton = By.id("btnBusqueda");
		driver.findElement(boton).click();
	}

	public static void addFriend(WebDriver driver, String nombre) {
		//Pulsamos el de agregar el amigo
		By boton = By.id("btnAgregar"+nombre);
		driver.findElement(boton).click();
	}

	public static void acceptFriend(WebDriver driver, String nombre) {
		//Pulsamos el de aceptar la invitacion
		By boton = By.id("btnAceptar"+nombre);
		driver.findElement(boton).click();
	}
	
	public static void goTo(WebDriver driver, String URL) {
		driver.navigate().to(URL);
	}

	public static void filterClient(WebDriver driver, String nombre) {
		//Escribimos lo pasado como parametro dentro del buscador de amigos
		WebElement userSeeker = driver.findElement(By.id("filtro-nombre"));
		userSeeker.click();
		userSeeker.clear();
		userSeeker.sendKeys(nombre);
		//Pulsamos el boton de filtrar
		By boton = By.id("btnFiltrar");
		driver.findElement(boton).click();
	}

	public static void cleanFilter(WebDriver driver) {
		//Pulsamos el boton de limpiar el filtro
		By boton = By.id("btnLimpiarFiltro");
		driver.findElement(boton).click();
	}

	public static void clickOnMessages(WebDriver driver, String nombre) {
		//Pulsamos el boton de los mensajes del pasado como parametro (nombre)
		By boton = By.id(nombre);
		driver.findElement(boton).click();
	}

	public static void clickOnWriter(WebDriver driver, String string) {
		//Escribimos lo pasado como mensaje
		WebElement userSeeker = driver.findElement(By.name("message"));
		userSeeker.click();
		userSeeker.clear();
		userSeeker.sendKeys(string);
		//Pulsamos el boton de enviar
		By boton = By.id("submitMessage");
		driver.findElement(boton).click();
	}
}