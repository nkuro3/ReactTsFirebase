// cheet sheet ------
// https://github.com/GomaGoma676/twitter_firebase/blob/master/src/components/Auth.tsx

import React, { useState } from "react";
import styles from "./Auth.module.css";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../features/userSlice";
import { auth, provider, storage } from "../firebase";
// uuidv4はreactでは使えない！！！！！
// 代わりにuuidをimportし、import * as uuid from "uuid";この形で宣言する
// import * as uuid from "uuid";

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Grid,
  Typography,
  makeStyles,
  Modal,
  IconButton,
  Box,
} from "@material-ui/core";

// icon (material-ui) ------
import SendIcon from "@material-ui/icons/Send";
import CameraIcon from "@material-ui/icons/Camera";
import EmailIcon from "@material-ui/icons/Email";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

const Auth: React.FC = () => {
  const classes = useStyles();

  // add --------
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
    await auth
      .sendPasswordResetEmail(resetEmail) // reset用メールを勝手に飛ばしてくれる！
      .then(() => {
        setOpenModal(false);
        setResetEmail("");
      })
      .catch((err) => {
        alert(err.message);
        setResetEmail("");
      });
  };

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // "!" non-null assetion TSの機能
    if (e.target.files![0]) {
      setAvatarImage(e.target.files![0]);
      // 同じファイルを連続して洗濯した場合、onChangeが反応しない仕様になっている
      // valueを初期化することで反応するようにしてあげる
      e.target.value = "";
    }
  };

  const signInGoogle = async () => {
    // firebaseのコンソールでgoogle認証を有効にする必要がある
    // フルスクリーン時はポップアップではなく別タブになる
    await auth.signInWithPopup(provider);
  };
  const signInEmail = async () => {
    await auth.signInWithEmailAndPassword(email, password);
  };
  const signUpEmail = async () => {
    const authUser = await auth.createUserWithEmailAndPassword(email, password);
    let url;
    if (avatarImage) {
      // これがエラーになるので代わりにuuidを使う <- （間違い）firebaseでの許可設定が間違ってただけ
      // firebaseの仕様で同じファイル名の場合は上書きされていくため、ランダムなファイル名を設定する。
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      // crypto.getRandomValues(new Uint32Array(N))：符号なしのランダムな英数字を引数分生成
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length]) //
        .join("");

      const fileName = randomChar + "_" + avatarImage.name;

      await storage.ref(`avatars/${fileName}`).put(avatarImage);
      url = await storage.ref("avatars").child(fileName).getDownloadURL();
    }
    await authUser.user?.updateProfile({
      displayName: username,
      photoURL: url,
    });
    dispatch(
      updateUserProfile({
        displayName: username,
        photoUrl: url,
      })
    );
  };

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {isLogin ? "Login" : "Register"}
          </Typography>
          <form className={classes.form} noValidate>
            {!isLogin && (
              <>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value);
                  }}
                />

                <Box
                  // textAlign="center" これ効かない
                  style={{
                    margin: "auto",
                    width: "fit-content",
                  }}
                >
                  <IconButton>
                    <label>
                      <AccountCircleIcon
                        fontSize="large"
                        className={
                          avatarImage
                            ? styles.login_addIconLoaded
                            : styles.login_addIcon
                        }
                      />
                      <input
                        className={styles.login_hiddenIcon}
                        type="file"
                        onChange={onChangeImageHandler}
                      />
                    </label>
                  </IconButton>
                </Box>
              </>
            )}
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              // onChangeにカーソル当てると React.ChangeEvent"Handler" になってるけど、違うみたい
              // イベントそのものを受けとる
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
              }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
              }}
            />
            <Button
              // type="submit"
              disabled={
                isLogin
                  ? !email || password.length < 6
                  : !username || !email || password.length < 6 || !avatarImage
              }
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              startIcon={<EmailIcon />}
              onClick={
                // firebaseの仕様でpasswordは6文字以上でないとエラーになる
                isLogin
                  ? () => signInEmail().catch((e) => alert(e.message))
                  : async () => signUpEmail().catch((e) => alert(e.message))

                // errがunknownでエラーになる
                // try {
                //   await signInEmail();
                // } catch (err: any/*これが必要*/) {
                //   alert(err.message);
                // }
              }
            >
              {isLogin ? "Login" : "Register"}
            </Button>

            <Grid container>
              <Grid item xs>
                <span
                  className={styles.login_reset}
                  onClick={() => setOpenModal(true)}
                >
                  Forgot password ?
                </span>
              </Grid>
              <Grid item>
                <span
                  className={styles.login_toggleMode}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? " Create new account ?" : "Back to login"}
                </span>
              </Grid>
            </Grid>

            <Button
              // type="submit"
              // submitではなくonClickで実行する処理を定義する。残したままにするとsubmitが優先（？）されonClickが実行されない。
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<CameraIcon />}
              className={classes.submit}
              onClick={signInGoogle}
            >
              Sign In with Google
            </Button>
          </form>
          {/* onClose: action in clicking outside modal */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <div style={getModalStyle()} className={classes.modal}>
              <div className={styles.login_modal}>
                <TextField
                  InputLabelProps={{
                    shrink: true,
                  }}
                  type="email"
                  name="email"
                  label="Reset E-mail"
                  value={resetEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setResetEmail(e.target.value);
                  }}
                />
                <IconButton onClick={sendResetEmail}>
                  <SendIcon />
                </IconButton>
              </div>
            </div>
          </Modal>
        </div>
      </Grid>
    </Grid>
  );
};

export default Auth;

// material-ui
const getModalStyle = () => {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
  image: {
    // backgroundImage: "url(https://source.unsplash.com/random)", // ランダムな画像を取ってきてくれる
    backgroundImage:
      "url(https://images.unsplash.com/photo-1658507165836-19ba97c737d3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80)", // copy by unsplash
    backgroundRepeat: "no-repeat",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  modal: {
    outline: "none",
    position: "absolute",
    width: 400,
    borderRadius: 10,
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10),
  },
}));
