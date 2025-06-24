import { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client";
import { UserContext } from "./UserContext";

const SocketContext = createContext();

export const useSocketContext = () => {
	return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { userInfo } = useContext(UserContext);

	useEffect(() => {
		if (userInfo) {
			const socket = io("http://localhost:5000", {
				query: {
					userId: userInfo._id,
				},
			});

			setSocket(socket);

			// socket.on() is used to listen to the events. can be used both on client and server side
			socket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			return () => socket.close();
		} else {
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
	}, [userInfo]);

	return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
};
