import {configureStore} from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import chatReducer from "../features/chat/chat.Slice";

export const store = configureStore({
    reducer:{
        auth:authReducer,
        chat:chatReducer,
    }
})