package com.uniovi.tests;
//Paquetes Java
import java.util.List;
//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;
import static org.junit.Assert.assertTrue;
//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;
//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;


//Ordenamos las pruebas por el nombre del mÃ©todo
@FixMethodOrder(MethodSorters.NAME_ASCENDING) 
public class NotaneitorTests {
	//En Windows (Debe ser la versiÃ³n 65.0.1 y desactivar las actualizacioens automÃ¡ticas)):
	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "C:\\Path\\geckodriver024win64.exe";
	//En MACOSX (Debe ser la versiÃ³n 65.0.1 y desactivar las actualizacioens automÃ¡ticas):
	//static String PathFirefox65 = "/Applications/Firefox 2.app/Contents/MacOS/firefox-bin";
	//static String PathFirefox64 = "/Applications/Firefox.app/Contents/MacOS/firefox-bin";
	//static String Geckdriver024 = "/Users/delacal/Documents/SDI1718/firefox/geckodriver024mac";
	//static String Geckdriver022 = "/Users/delacal/Documents/SDI1718/firefox/geckodriver023mac";
	//ComÃºn a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024); 
	static String URL = "https://localhost:8081";


	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}


	@Before
	public void setUp(){
		driver.navigate().to(URL);
	}
	@After
	public void tearDown(){
		driver.manage().deleteAllCookies();
	}
	@BeforeClass 
	static public void begin() {
		//COnfiguramos las pruebas.
		//Fijamos el timeout en cada opciÃ³n de carga de una vista. 2 segundos.
		PO_View.setTimeout(6);

	}

	//PR01. Registro de Usuario con datos válidos /  
	@Test
	public void PR01() {
		//Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		//Rellenamos el formulario de registro.
		PO_RegisterView.fillForm(driver, "Eduardo", "Perez", "eduardo@email.com", "99009900", "99009900");
		//Comprobamos que estamos en la vista de identificación
		PO_View.checkElement(driver, "text", "Identificación de usuario");
		//Rellenamos el formulario de identificación
		PO_LoginView.fillForm(driver, "eduardo@email.com", "99009900");
		//Comprobamos que entramos en la vista de usuarios de la aplicación (privado)
		PO_View.checkElement(driver, "text", "Lista de usuarios de la aplicación");
		//Nos desconectamos
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
	}

	//PR02. Registro de Usuario con datos inválidos (email vacío, nombre vacío, apellidos vacíos).
	@Test
	public void PR02() {
		//Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		//Rellenamos el formulario de registro.
		PO_RegisterView.fillForm(driver, "", "", "", "99009900", "99009900");
		//Comprobamos que no cambia de ventana (muestra un pop-up de error)
		PO_View.checkElement(driver, "text", "Registrar usuario");
	}

	//PR03. Registro de Usuario con datos inválidos (repetición de contraseña inválida).
	@Test
	public void PR03() {
		//Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		//Rellenamos el formulario de registro.
		PO_RegisterView.fillForm(driver, "Mariano", "Perez", "mariano@email.com", "99009900", "1");
		//Comprobamos que muestra el error correspondiente
		PO_View.checkElement(driver, "text", "Las contraseñas no coinciden");
	}
	
	//PR04. Registro de Usuario con datos inválidos (email existente).
	@Test
	public void PR04() {
		//Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		//Rellenamos el formulario de registro.
		PO_RegisterView.fillForm(driver, "Eduardo", "Perez", "eduardo@email.com", "99009900", "99009900");
		//Comprobamos que muestra el error correspondiente
		PO_View.checkElement(driver, "text", "Email no valido");
	}
	
	//PR05. Inicio de sesión con datos válidos (usuario estándar).
	@Test
	public void PR05() {
		//Vamos al formulario de identificación
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");		
		//Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "eduardo@email.com", "99009900");
		//Comprobamos que entramos en la vista de usuarios de la aplicación (privado)
		PO_View.checkElement(driver, "text", "Lista de usuarios de la aplicación");
		//Nos desconectamos
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
	}
	
	//PR06. Inicio de sesión con datos inválidos (usuario estándar, campo email y contraseña vacíos).
	@Test
	public void PR06() {
		//Vamos al formulario de identificación
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");		
		//Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "", "");
		//Comprobamos que nos mantenemos en la misma página de identificacion (muestra un error pop-up)
		PO_View.checkElement(driver, "text", "Identificación de usuario");
	}
	
	//PR07. Inicio de sesión con datos inválidos (usuario estándar, email existente, pero contraseña incorrecta).
	@Test
	public void PR07() {
		//Vamos al formulario de identificación
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");		
		//Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "pepe@email.com", "mal");
		//Comprobamos que muestra el error correspondiente
		PO_View.checkElement(driver, "text", "Email o password incorrecto");
	}	
	
	//PR08. Inicio de sesión con datos inválidos (usuario estándar, email no existente y contraseña no vacía).
	@Test
	public void PR08() {
		//Vamos al formulario de identificación
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");		
		//Rellenamos el formulario.
		PO_LoginView.fillForm(driver, "inexistente@email.com", "mal");
		//Comprobamos que muestra el error correspondiente
		PO_View.checkElement(driver, "text", "Email o password incorrecto");
	}	
	
	//PR09. Hacer click en la opción de salir de sesión y comprobar que se redirige a la página de inicio de sesión (Login).
	@Test
	public void PR09() {
		//Vamos al formulario de identificacion
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		//Rellenamos el formulario de identificacion.
		PO_LoginView.fillForm(driver, "pepe@email.com", "123456");	
		//Comprobamos que entramos en la vista de usuarios de la aplicación (privado)
		PO_View.checkElement(driver, "text", "Lista de usuarios de la aplicación");
		//Nos desconectamos
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Identificación de usuario");
	}	
	//PR10. Comprobar que el botón cerrar sesión no está visible si el usuario no está autenticado.
	@Test
	public void PR10() {
		//Comprobamos que no se muestra el boton de desconectar.
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "Desconectar", PO_View.getTimeout());
	}	
	
	//PR11. Mostrar el listado de usuarios y comprobar que se muestran todos los que existen en el sistema. 
	@Test
	public void PR11() {
		//Vamos al formulario de identificacion
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		//Rellenamos el formulario
		PO_LoginView.fillForm(driver, "pepe@email.com", "123456");	
		//Comprobamos que entramos en la vista de usuarios de la aplicación (privado)
		PO_View.checkElement(driver, "text", "Lista de usuarios de la aplicación");		
		//Comprobamos cada usuario que debería de aparecer
		PO_View.checkElement(driver, "text", "pepe@email.com");
		PO_View.checkElement(driver, "text", "pedro@email.com");
		PO_View.checkElement(driver, "text", "lau8989@email.com");
		PO_View.checkElement(driver, "text", "ramiro@email.com");
		PO_View.checkElement(driver, "text", "dani99@email.com");
		//Pasamos a la página 2
		PO_PrivateView.clickNextPage(driver, "2");
		PO_View.checkElement(driver, "text", "pergom@email.com");
		PO_View.checkElement(driver, "text", "pelamar@email.com");
		PO_View.checkElement(driver, "text", "bencam@email.com");
		PO_View.checkElement(driver, "text", "mariano@email.com");
		//Nos desconectamos
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Identificación de usuario");
	}	
	
	
	//PR12. Hacer una búsqueda con el campo vacío y comprobar que se muestra la página que corresponde con el listado usuarios existentes en el sistema
	@Test
	public void PR12() {
		//Vamos al formulario de identificacion
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		//Rellenamos el formulario
		PO_LoginView.fillForm(driver, "pepe@email.com", "123456");	
		//Comprobamos que entramos en la vista de usuarios de la aplicación (privado)
		PO_View.checkElement(driver, "text", "Lista de usuarios de la aplicación");		
		//Vamos al buscador y dejamos el campo vacío. Luego, clicamos el botón de "buscar".
		PO_PrivateView.writeOnSeeker(driver, "");
		//Comprobamos cada usuario que debería de aparecer
		PO_View.checkElement(driver, "text", "pepe@email.com");
		PO_View.checkElement(driver, "text", "pedro@email.com");
		PO_View.checkElement(driver, "text", "lau8989@email.com");
		PO_View.checkElement(driver, "text", "ramiro@email.com");
		PO_View.checkElement(driver, "text", "dani99@email.com");
		//Pasamos a la página 2
		PO_PrivateView.clickNextPage(driver, "2");
		PO_View.checkElement(driver, "text", "pergom@email.com");
		PO_View.checkElement(driver, "text", "pelamar@email.com");
		PO_View.checkElement(driver, "text", "bencam@email.com");
		PO_View.checkElement(driver, "text", "mariano@email.com");
	}	
	
	//PR13. Hacer una búsqueda escribiendo en el campo un texto que no exista y comprobar que se muestra la página que corresponde, con la lista de usuarios vacía.
	@Test
	public void PR13() {
		//Comprobamos que estamos en la vista de usuarios de la aplicación
		PO_View.checkElement(driver, "text", "Lista de usuarios de la aplicación");		
		//Vamos al buscador y escribimos algo que no exista. Luego, clicamos el botón de "buscar".
		PO_PrivateView.writeOnSeeker(driver, "superman");
		//Comprobamos que no aparece ningún usuario
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "pepe@email.com", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "pedro@email.com", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "lau8989@email.com", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "ramiro@email.com", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "dani99@email.com", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "pergom@email.com", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "pelamar@email.com", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "bencam@email.com", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "mariano@email.com", PO_View.getTimeout());
	}	
	
	//PR14. Hacer una búsqueda con un texto específico y comprobar que se muestra la página que
	//corresponde, con la lista de usuarios en los que el texto especificados sea parte de su nombre, apellidos o
	//de su email.
	@Test
	public void PR14() {
		//Comprobamos que estamos en la vista de usuarios de la aplicación
		PO_View.checkElement(driver, "text", "Lista de usuarios de la aplicación");		
		//Vamos al buscador y escribimos el email del usuario que queremos buscar. Luego, clicamos el botón de "buscar".
		PO_PrivateView.writeOnSeeker(driver, "mariano@email.com");
		//Comprobamos que aparece el usuario que buscamos
		PO_View.checkElement(driver, "text", "mariano@email.com");
	}	
	
	//PR15. Desde el listado de usuarios de la aplicación, enviar una invitación de amistad a un usuario.
	//Comprobar que la solicitud de amistad aparece en el listado de invitaciones (punto siguiente). 
	@Test
	public void PR15() {
		//Agregamos el amigo que acabamos de buscar
		PO_PrivateView.addFriend(driver, "Mariano");
		//Comprobamos que estamos en la vista de usuarios de la aplicación (sin errores)
		PO_View.checkElement(driver, "text", "Lista de usuarios de la aplicación");	
	}	
	
	//PR16. Desde el listado de usuarios de la aplicación, enviar una invitación de amistad a un usuario al
	//que ya le habíamos enviado la invitación previamente. No debería dejarnos enviar la invitación, se podría
	//ocultar el botón de enviar invitación o notificar que ya había sido enviada previamente
	@Test
	public void PR16() {
		//Vamos al buscador y escribimos el email del usuario que queremos buscar. Luego, clicamos el botón de "buscar".
		PO_PrivateView.writeOnSeeker(driver, "mariano@email.com");
		//Comprobamos que aparece el usuario que buscamos
		PO_View.checkElement(driver, "text", "mariano@email.com");
		//Intentamos agregar de nuevo al mismo amigo
		PO_PrivateView.addFriend(driver, "Mariano");
		//Comprobamos que aparece el error correspondiente
		PO_View.checkElement(driver, "text", "Ya has mandado una solicitud a este usuario");
		//Nos desconectamos
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Identificación de usuario");
	}	
	
	//PR017. Mostrar el listado de invitaciones de amistad recibidas. Comprobar con un listado que
	//contenga varias invitaciones recibidas
	@Test
	public void PR17() {
		//Vamos al formulario de identificacion
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		//Rellenamos el formulario
		PO_LoginView.fillForm(driver, "mariano@email.com", "99009900");	
		//Comprobamos que entramos en la vista de usuarios de la aplicación (privado)
		PO_View.checkElement(driver, "text", "Lista de usuarios de la aplicación");	
		//Vamos a la pestaña de invitaciones
		PO_HomeView.clickOption(driver, "invitaciones", "class", "btn btn-primary");
		//Comprobamos que estamos en la pestaña de invitaciones
		PO_View.checkElement(driver, "text", "Solicitudes de amistad recibidas");
		//Comprobamos que sale la invitación de pepe
		PO_View.checkElement(driver, "text", "Pepe");
	}	
	
	//PR18. Sobre el listado de invitaciones recibidas. Hacer click en el botón/enlace de una de ellas y
	//comprobar que dicha solicitud desaparece del listado de invitaciones.
	@Test
	public void PR18() {
		//Aceptamos la invitacion de amistad de Pepe
		PO_PrivateView.acceptFriend(driver, "Pepe");
		//Comprobamos que desaparece
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "Pepe", PO_View.getTimeout());
	}	
	
	//PR19. Mostrar el listado de amigos de un usuario. Comprobar que el listado contiene los amigos que deben ser
	@Test
	public void PR19() {
		//Vamos a la pestaña de amigos
		PO_HomeView.clickOption(driver, "amigos", "class", "btn btn-primary");	
		//Comprobamos que estamos en la pestaña de amigos
		PO_View.checkElement(driver, "text", "Lista de amigos");
		//Comprobamos que sale nuestro nuevo amigo Pepe
		PO_View.checkElement(driver, "text", "pepe@email.com");
		//Nos desconectamos
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Identificación de usuario");
	}	
	
	//P20. Intentar acceder sin estar autenticado a la opción de listado de usuarios. Se deberá volver al
	//formulario de login.
	@Test
	public void PR20() {
		//Intentamos acceder a la pestaña de usuarios
		PO_HomeView.clickOption(driver, "usuarios", "class", "btn btn-primary");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Identificación de usuario");
	}	
	
	//PR21. Intentar acceder sin estar autenticado a la opción de listado de invitaciones de amistad recibida
	//de un usuario estándar. Se deberá volver al formulario de login
	@Test
	public void PR21() {
		//Intentamos acceder a la pestaña de usuarios
		PO_HomeView.clickOption(driver, "invitaciones", "class", "btn btn-primary");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Identificación de usuario");	
	}	
	
	//PR22. Intentar acceder estando autenticado como usuario standard a la lista de amigos de otro
	//usuario. Se deberá mostrar un mensaje de acción indebida.
	@Test
	public void PR22() {
		//Intentamos acceder a la pestaña de usuarios
		PO_HomeView.clickOption(driver, "amigos", "class", "btn btn-primary");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Identificación de usuario");		
	}	
	
	//PR23. (jQuery) Inicio de sesión con datos válidos.	
	@Test
	public void PR23() {
		//Accedemos al cliente.html
		PO_PrivateView.goTo(driver, "https://localhost:8081/cliente.html");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Email:");		
		PO_View.checkElement(driver, "text", "Password:");	
		//Rellenamos el formulario
		PO_LoginView.fillForm(driver, "pepe@email.com", "123456");
		//Comprobamos que estamos viendo la lista de amigos
		PO_View.checkElement(driver, "text", "Lista de amigos");
	}	
	
	//PR24. (jQuery) Inicio de sesión con datos inválidos (usuario no existente en la aplicación)
	@Test
	public void PR24() {
		//Accedemos al cliente.html
		PO_PrivateView.goTo(driver, "https://localhost:8081/cliente.html");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Email:");		
		PO_View.checkElement(driver, "text", "Password:");	
		//Rellenamos el formulario
		PO_LoginView.fillForm(driver, "meloacabodeinventar@email.com", "123456");
		//Comprobamos que muestra el error correspondiente
		PO_View.checkElement(driver, "text", "Usuario no encontrado");	
	}	
	
	//PR25. (jQuery) Acceder a la lista de amigos de un usuario, que al menos tenga tres amigos
	@Test
	public void PR25() {
		//Accedemos al cliente.html
		PO_PrivateView.goTo(driver, "https://localhost:8081/cliente.html");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Email:");		
		PO_View.checkElement(driver, "text", "Password:");	
		//Rellenamos el formulario
		PO_LoginView.fillForm(driver, "pepe@email.com", "123456");
		//Comprobamos que estamos viendo la lista de amigos
		PO_View.checkElement(driver, "text", "Lista de amigos");	
	}	
	
	//PR26. (jQuery) Acceder a la lista de amigos de un usuario, y realizar un filtrado para encontrar a un amigo
	//concreto, el nombre a buscar debe coincidir con el de un amigo.
	@Test
	public void PR26() {
		//Accedemos al cliente.html
		PO_PrivateView.goTo(driver, "https://localhost:8081/cliente.html");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Email:");		
		PO_View.checkElement(driver, "text", "Password:");	
		//Rellenamos el formulario
		PO_LoginView.fillForm(driver, "pepe@email.com", "123456");
		//Comprobamos que estamos viendo la lista de amigos
		PO_View.checkElement(driver, "text", "Lista de amigos");		
		//Buscamos un amigo con nombre "Pedro"
		PO_PrivateView.filterClient(driver, "Pedro");
		SeleniumUtils.esperarSegundos(driver, 3);
		//Comprobamos que efectivamente nuestro amigo Pedro aparece en la lista
		PO_View.checkElement(driver, "text", "Pedro");
		PO_View.checkElement(driver, "text", "pedro@email.com");	
		//Reseteamos el filtro y volvemos a mostrar todo los amigos
		PO_PrivateView.cleanFilter(driver);
	}	
	
	//PR27. (jQuery) Acceder a la lista de mensajes de un amigo “chat”, la lista debe contener al menos tres mensajes.
	@Test
	public void PR27() {
		//Accedemos al cliente.html
		PO_PrivateView.goTo(driver, "https://localhost:8081/cliente.html");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Email:");		
		PO_View.checkElement(driver, "text", "Password:");	
		//Rellenamos el formulario
		PO_LoginView.fillForm(driver, "pepe@email.com", "123456");
		//Comprobamos que estamos viendo la lista de amigos
		PO_View.checkElement(driver, "text", "Lista de amigos");	
		SeleniumUtils.esperarSegundos(driver, 5);
		//Clicamos en el boton de los mensajes de Bentito
		PO_PrivateView.clickOnMessages(driver, "Bentito");
		//Comprobamos que contiene los tres mensajes correspondientes
		PO_View.checkElement(driver, "text", "Mensaje numero 1");
		PO_View.checkElement(driver, "text", "Mensaje numero 2");
		PO_View.checkElement(driver, "text", "Mensaje numero 3");
	}	
	
	//PR28. (jQuery) Acceder a la lista de mensajes de un amigo “chat” y crear un nuevo mensaje, validar que el
	//mensaje aparece en la lista de mensajes.
	@Test
	public void PR28() {
		//Accedemos al cliente.html
		PO_PrivateView.goTo(driver, "https://localhost:8081/cliente.html");
		//Comprobamos que estamos en la ventana de login
		PO_View.checkElement(driver, "text", "Email:");		
		PO_View.checkElement(driver, "text", "Password:");	
		//Rellenamos el formulario
		PO_LoginView.fillForm(driver, "pepe@email.com", "123456");
		//Comprobamos que estamos viendo la lista de amigos
		PO_View.checkElement(driver, "text", "Lista de amigos");	
		SeleniumUtils.esperarSegundos(driver, 5);
		//Clicamos en el boton de los mensajes de Bentito
		PO_PrivateView.clickOnMessages(driver, "Bentito");
		SeleniumUtils.esperarSegundos(driver, 6);
		//Enviamos un nuevo mensaje ahora mismo
		PO_PrivateView.clickOnWriter(driver, "Mensaje creado ahora mismo");	
		//Comprobamos que aparece el mensaje enviado tras un breve lapso de tiempo.
		SeleniumUtils.esperarSegundos(driver, 6);
		PO_View.checkElement(driver, "text", "Mensaje creado ahora mismo");
	}	
	
	// ---------------------------------------------OPCIONALES-----------------------------------------------------------
	//PR029. Sin hacer /
	@Test
	public void PR29() {
		assertTrue("PR29 sin hacer", true);			
	}

	//PR030. Sin hacer /
	@Test
	public void PR30() {
		assertTrue("PR30 sin hacer", true);			
	}
	
	//PR031. Sin hacer /
	@Test
	public void PR31() {
		assertTrue("PR31 sin hacer", true);			
	}
	

//	@AfterClass
//	static public void end() {
//		//Cerramos el navegador al finalizar las pruebas
//		driver.quit();
//	}
		
}

