export default class IsoDateHelper {
    static overrideIsoDate(isoDate) {
        let utc = isoDate;
        // Overide ISO Date
        utc.isISODate = true;
        // override method 
        utc.getHours = () => {
            return utc.getUTCHours();
        }
        utc.getMinutes = () => {
            return utc.getUTCMinutes();
        }
        utc.getSeconds = () => {
            return utc.getUTCSeconds();
        }
        utc.setFullYear = (...years) => {
            utc.setUTCFullYear(...years);
        }
        utc.setMonth = (...months) => {
            utc.setUTCMonth(...months);
        }
        utc.setDate = (date) => {
            utc.setUTCDate(date);
        }
        utc.setHours = (...hours) => {
            utc.setUTCHours(...hours);
        }
        utc.setMinutes = (...minutes) => {
            utc.setUTCMinutes(...minutes);
        }
        utc.setSeconds = (...seconds) => {
            utc.setUTCSeconds(...seconds);
        }
        utc.getFullYear = () => {
            return utc.getUTCFullYear();
        }
        utc.getMonth = () => {
            return utc.getUTCMonth();
        }
        utc.getDate = () => {
            return utc.getUTCDate();
        }
        utc.getDay = () => {
            return utc.getUTCDay();
        }
        utc.toString = () => {
            return utc.toISOString();
        }
    }
    static getISODateByTimezone(timeZone) {
        let currentTime = new Date();
        if (timeZone) {
           let options = { timeZone: timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
           let formatter = new Intl.DateTimeFormat(['en-US'], options),
                // use local is en-GB to get timeString equal '24/05/2018, 12:34:51'
                timeString = formatter.format(currentTime);
            timeString = timeString.replace(' ', '');
            let dateArr = timeString.split(',')[0].split('/').map(item => +item),
                timeArr = timeString.split(',')[1].split(':').map(item => +item);
            // set Date and Time
            currentTime.setUTCFullYear(dateArr[2], dateArr[0] - 1, dateArr[1]);
            currentTime.setUTCHours(timeArr[0], timeArr[1], timeArr[2], 0);
            IsoDateHelper.overrideIsoDate(currentTime);
            return currentTime;
        }
        currentTime.setUTCHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds(), 0);
        IsoDateHelper.overrideIsoDate(currentTime);
        return currentTime;
    }
}
