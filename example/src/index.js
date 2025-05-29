import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

document.documentElement.style.setProperty(
	"--theme-background",
	process.env.THEME_BACKGROUND
);
document.documentElement.style.setProperty(
	"--theme-color",
	process.env.THEME_COLOR
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
