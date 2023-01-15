import React, { useEffect } from "react";
import style from "./App.module.css";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, login, logout } from "./features/userSlice";
import { auth } from "./firebase";
import Feed from "./components/Feed";
import Auth from "./components/Auth";

const App: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  console.log(user.uid);

  useEffect(() => {
    // onAuthStateChanged: login,logout時に実行される
    const unSub = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName,
          })
        );
      } else {
        dispatch(logout());
      }
    });
    // returnはunmount時に実行される(cleanup)
    return () => {
      unSub();
    };
  }, [dispatch]);

  /**
   * @ref [フラグメント](https://ja.reactjs.org/docs/fragments.html)
   */
  return (
    <>
      {user.uid ? (
        <div className={style.app}>
          <Feed />
        </div>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default App;
