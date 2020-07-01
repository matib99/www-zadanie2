import { Builder, ThenableWebDriver, WebElement, By, Key, WebElementPromise, until } from 'selenium-webdriver';

const passwordChangeTest = async () => {
    let driver = await new Builder().forBrowser("firefox").build();
    await driver.get("http://127.0.0.1:3000");
    await driver.findElement(By.name("login")).sendKeys("user1");
    await driver.findElement(By.name("password")).sendKeys("user1", Key.RETURN);
    await driver.get("http://127.0.0.1:3000/quizzes/all");
    var cookies = await driver.manage().getCookies();
    await driver.manage().deleteAllCookies();
    await driver.get("http://127.0.0.1:3000");
    await driver.findElement(By.name("login")).sendKeys("user1");
    await driver.findElement(By.name("password")).sendKeys("user1", Key.RETURN);
    await driver.get("http://127.0.0.1:3000/users/changepassword");
    await driver.findElement(By.name("oldPassword")).sendKeys("user1");
    await driver.findElement(By.name("newPassword")).sendKeys("user11");
    await driver.findElement(By.name("newPassword2")).sendKeys("user11", Key.RETURN);
    await driver.get("http://127.0.0.1:3000");
    await driver.manage().deleteAllCookies();
    for(var cookie of cookies) {
        await driver.manage().addCookie(cookie)
    }
    await driver.get("http://127.0.0.1:3000/quizzes/all");
}

const cleanAfterTest = async () => {
    let driver = await new Builder().forBrowser("firefox").build();
    await driver.get("http://127.0.0.1:3000");
    await driver.findElement(By.name("login")).sendKeys("user1");
    await driver.findElement(By.name("password")).sendKeys("user11", Key.RETURN);
    await driver.get("http://127.0.0.1:3000/users/changepassword");
    await driver.findElement(By.name("oldPassword")).sendKeys("user11");
    await driver.findElement(By.name("newPassword")).sendKeys("user1");
    await driver.findElement(By.name("newPassword2")).sendKeys("user1", Key.RETURN);
    await driver.get("http://127.0.0.1:3000");
    console.log("CLENED");
}

passwordChangeTest()
.then((ret) => {console.log('OK'); cleanAfterTest();})
.catch((err) => console.log('ERR', err))