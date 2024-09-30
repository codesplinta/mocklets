export default function greetingMaker (subjectFullName = 'John Doe', subjectTitle = 'Mr.') {
    const format = window.sessionStorage.getItem('greeting:format');
    const today = new Date();
    const hourOfToDay = today.getHours();
 
    let salutation = "Good evening";
 
    if (hourOfToDay < 12) {
       salutation = "Good morning";
    }
 
    if (hourOfToDay >= 12 && hourOfToDay <= 16) {
       salutation = "Good afternoon";
    }
 
    if (format === "old-fashioned") {
      salutation = "Good day";
    }
 
    return `${salutation}, ${subjectTitle} ${subjectFullName}`;
 }