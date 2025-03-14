// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyDme0rA61w_CaHr1brU8ttBkk0bPp6Cvgk',
	authDomain: 'rewardshq-f6ed4.firebaseapp.com',
	projectId: 'rewardshq-f6ed4',
	storageBucket: 'rewardshq-f6ed4.firebasestorage.app',
	messagingSenderId: '114512713166',
	appId: '1:114512713166:web:ba772244718fd8e4dcc79f',
	measurementId: 'G-C7XPS6799J',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const logFirebaseEvent = (eventName: string, eventParams?: object) => {
	if (analytics) {
		logEvent(analytics, eventName, eventParams);
	}
};
