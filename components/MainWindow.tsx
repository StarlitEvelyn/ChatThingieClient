import { useEffect, useRef, useState } from "react";
import getSocket from "../handlers/socket";
import SideBar from "../components/SideBar";
import { Keyboard, Platform, View } from "react-native";
import { Directions, DrawerLayout, Gesture, GestureDetector } from "react-native-gesture-handler";
import ChatWindow, { Message } from "../components/ChatWindow";
import { storeToken, storeUser, Token } from "../handlers/storage";

const loadUser = async () => {
	await storeToken("1234");
	const token = await Token.getToken();

	try {
		if (!token) return;
		const response = await fetch("https://api.staryhub.net/users/:id", {
			headers: {
				accesstoken: token,
			},
		});

		const user = await response.json();

		storeUser(user);
	} catch (e) {
		console.error(e);
	}
};

export default function MainWindow() {
	loadUser();

	const [newMessage, setNewMessage] = useState<Message>();
	const [selectedChannel, setSelectedChannel] = useState(0);
	const [title, setTitle] = useState("");

	const getActiveChannel = () => {
		return selectedChannel;
	};

	const isWeb = Platform.OS == "web";

	useEffect(() => {
		getSocket(setNewMessage, getActiveChannel, newMessage);
	}, [selectedChannel]);

	if (isWeb)
		return (
			<View style={{ flexDirection: "row", flex: 1 }}>
				<SideBar selectedChannel={getActiveChannel} setSelectedChannel={setSelectedChannel} setTitle={setTitle} />
				<ChatWindow newMessage={newMessage} activeChannel={getActiveChannel} title={title} />
			</View>
		);

	const drawer = useRef<DrawerLayout>(null);

	const fling = Gesture.Fling();
	fling.direction(Directions.RIGHT);
	fling.onEnd(() => {
		Keyboard.dismiss();
		drawer.current?.openDrawer();
	});

	return (
		<GestureDetector gesture={fling}>
			<DrawerLayout ref={drawer} drawerType="front" drawerWidth={235} drawerBackgroundColor="#00000088" drawerPosition="left" renderNavigationView={() => <SideBar selectedChannel={getActiveChannel} setSelectedChannel={setSelectedChannel} setTitle={setTitle} />}>
				<ChatWindow newMessage={newMessage} activeChannel={getActiveChannel} title={title} />
			</DrawerLayout>
		</GestureDetector>
	);
}
