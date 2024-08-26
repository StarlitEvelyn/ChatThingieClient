import AsyncStorage from "@react-native-async-storage/async-storage";
import { Server } from "../components/ServerList";
import { Platform } from "react-native";

export type UserType = {
	id: string;
	username: string;
};

export class User {
	static user: UserType = {} as UserType;

	static async getUserObject() {
		if (!User.user.username) {
			User.user = await getUser();
		}

		return User.user;
	}

	static updateUserID(id: string) {
		User.user.id = id;
	}
}

const storeUser = async (user: UserType) => {
	try {
		await AsyncStorage.setItem("user", JSON.stringify(user));
		User.updateUserID(user.id);
	} catch (e) {
		console.error(e);
	}
};

const getUser = async () => {
	const user: UserType = JSON.parse((await AsyncStorage.getItem("user")) ?? "");
	// const response = await fetch("https://api.staryhub.net/users/:id", {
	// 	headers: {
	// 		"Accept": "*/*",
	// 		"Content-Type": "application/json",
	// 		"accesstoken": await Token.getToken(),
	// 	},
	// });
	// const user = await response.json();

	return user;
};

export class Token {
	static token: string | null;

	static async getToken() {
		if (!Token.token) {
			Token.token = await getToken();
		}
		return Token.token;
	}
	static async clear() {
		if (Token.token) {
			Token.token = null;
			AsyncStorage.removeItem("token");
			expo.reloadAppAsync("Logging out...");
		}
	}
}

const storeToken = async (token: string) => {
	try {
		await AsyncStorage.setItem("token", token);
	} catch (e) {
		console.error(e);
	}
};

const getToken = async () => {
	try {
		const token = await AsyncStorage.getItem("token");
		return token ?? "";
	} catch (e) {
		console.error(e);
	}
	return ""; // Fixes typescript bullshit, do not REMOVE
};

export type TypeLocalSettings = {
	servers: Server[];
	LinkInNative: boolean;
};
class LocalSettings {
	static settings: TypeLocalSettings;

	static async get() {
		if (!LocalSettings.settings) {
			LocalSettings.settings = await getLocalSettings();
		}

		return LocalSettings.settings;
	}

	static async save(newData: typeof this.settings) {
		await AsyncStorage.setItem("localSettings", JSON.stringify(newData));
		return newData;
	}
}
export { storeUser, storeToken, LocalSettings };

const getLocalSettings = async () => {
	// If running on web, get settings from electron's storage
	if (Platform.OS == "web")
		try {
			const response = await fetch(`http://127.0.0.1:${require("../electron/LocalServer.json").port}/settings`, {
				method: "POST",
				headers: {
					"Accept": "*/*",
					"Content-Type": "application/json",
				},
			});
			return await response.json();
		} catch (e) {
			console.error(e);
		}

	// If running on Android/iOS get settings from react storage
	return await JSON.parse((await AsyncStorage.getItem("localSettings")) ?? "{}");
};
