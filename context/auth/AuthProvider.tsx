import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FC, useEffect, useReducer } from "react";
import { entriesApi } from "../../apis";
import { IUser } from "../../interfaces";
import { AuthContext, authReducer } from "./";

interface Props {
  children: React.ReactNode;
}

export interface AuthState {
  isLoggedIn: boolean;
  user?: IUser;
}

const AUTH_INITIAL_STATE: AuthState = {
  isLoggedIn: false,
  user: undefined,
};

export const AuthProvider: FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, AUTH_INITIAL_STATE);
  const router = useRouter();
  const { data, status } = useSession();

  // useEffect(() => {
  //   checkToken();
  // }, []);
  useEffect(() => {
    if (status === "authenticated") {
      dispatch({
        type: "[Auth] - Login",
        payload: data.user as IUser,
      });
    }
  }, [status, data]);

  const checkToken = async () => {
    if (!Cookies.get("token")) {
      return;
    }
    const coockie = Cookies.get("token");
    try {
      const { data } = await entriesApi.post("/user/validate-token", {
        coockie,
      });
      const { token, user } = data;
      Cookies.set("token", token);
      dispatch({ type: "[Auth] - Login", payload: user });
    } catch (error) {
      return Cookies.remove("token");
    }
  };

  const loginUser = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const { data } = await entriesApi.post("/user/login", {
        email,
        password,
      });
      const { token, user } = data;
      Cookies.set("token", token);
      dispatch({ type: "[Auth] - Login", payload: user });

      return true;
    } catch (error) {
      return false;
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ hasError: boolean; message?: string }> => {
    try {
      const { data } = await entriesApi.post("/user/register", {
        name,
        email,
        password,
      });
      const { token, user } = data;
      Cookies.set("token", token);
      dispatch({ type: "[Auth] - Login", payload: user });

      return {
        hasError: false,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const e = error as AxiosError;
        return {
          hasError: true,
          message: e.message,
        };
      }
      return {
        hasError: true,
        message: "No se pudo crear el usuario, intente de nuevo",
      };
    }
  };

  const logout = () => {
    // Cookies.remove("token");
    Cookies.remove("cart");
    Cookies.remove("firstName"),
      Cookies.remove("lastName"),
      Cookies.remove("address1"),
      Cookies.remove("address2"),
      Cookies.remove("city"),
      Cookies.remove("country"),
      Cookies.remove("phoneNumber"),
      Cookies.remove("zipCode"),
      // router.reload();
      signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginUser,
        registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
