import {Router} from "express";
import {authUser} from "../middlewares/auth.middleware.js";
import {sendMessage,getChats,getMessages,deleteChat,deleteAllChats,renameChat} from "../controller/chat.controller.js";

const chatRouter = Router();

chatRouter.post("/message",authUser,sendMessage)
chatRouter.get("/",authUser,getChats);
chatRouter.get("/:chatId/messages",authUser,getMessages);

chatRouter.delete("/delete-all",authUser,deleteAllChats)
chatRouter.delete("/delete/:chatId",authUser,deleteChat)
chatRouter.patch("/rename/:chatId",authUser,renameChat)


export default chatRouter;