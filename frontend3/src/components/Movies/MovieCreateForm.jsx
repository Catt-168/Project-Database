import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LanguageIcon from "@mui/icons-material/Language";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import RedditIcon from "@mui/icons-material/Reddit";
import {
  Alert,
  Autocomplete,
  IconButton,
  Rating,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SERVER } from "../../constants";
import { Colors, STATUS_TYPE } from "../../helpers/constants";
import restClient from "../../helpers/restClient";
import { capitalizeFirstLetter } from "../../helpers/textHelper";
import ActorGenreLanguageCreateModal from "../Admin/Actor/ActorGenreLanguageCreateModal";
import GenericButton from "../Core/GenericButton";
import TextInput from "../Input/TextInput";
import AdminNavigation from "../Navigation/AdminNavigation";
import UserNavigation from "../Navigation/UserNavigation";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#fff",
  border: "2px solid",
  borderColor: Colors.primary,
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
};

const errorDefaultState = {
  status: false,
  message: "",
};

const modalDefaultState = {
  genre: false,
  language: false,
  actor: false,
};

const urlPattern =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|user\/[\w]+\/)|youtu\.be\/)([\w-]{11})(?:\S+)?$/;
export default function MovieCreateForm() {
  const user = JSON.parse(localStorage.getItem("user"));
  const categories = [
    { id: 1, name: "blog" },
    { id: 2, name: "music" },
    { id: 3, name: "video" },
  ];
  const [category, setCategory] = useState([]);
  const navigate = useNavigate();
  const [fData, setFData] = useState({
    title: "",
    description: "",
    genres: [],
    rating: 0,
    length: 0,
    releasedYear: 0,
    price: 0,
    file: null,
    // numberInStock: 0,
    trailerLink: "",
    language: [],
    actors: [],
  });
  const [status, setStatus] = useState("idle");
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [actors, setActors] = useState([]);

  const [modalOpen, setModalOpen] = useState(modalDefaultState);
  const [actor, setActor] = useState({
    name: "",
    file: null,
  });
  const [genre, setGenre] = useState({ name: "" });
  const [language, setLanguage] = useState({ name: "" });
  const [actorStatus, setActorStatus] = useState(STATUS_TYPE.idle);
  const [state, setState] = useState({
    openSnackBar: false,
    vertical: "bottom",
    horizontal: "right",
    message: "",
  });
  const [genreError, setGenreError] = useState({ status: false, message: "" });
  const [actorError, setActorError] = useState({ status: false, message: "" });
  const [languageError, setLanguageError] = useState({
    status: false,
    message: "",
  });
  const { vertical, horizontal, openSnackBar } = state;

  const handleOpenSnackBar = () => () => {
    setState({ ...state, openSnackBar: true });
  };

  const handleCloseSnackBar = () => {
    setState({ ...state, openSnackBar: false });
  };

  function handleChange(e) {
    const { name, value, files } = e.target;
    setFData({
      ...fData,
      [name]: files ? files[0] : value,
    });
  }

  async function fetchGenre() {
    try {
      const { data } = await restClient.get(`${SERVER}/genres`);
      setGenres(data);
    } catch (e) {
      console.log(e);
    } finally {
      setStatus("success");
    }
  }

  async function fetchLanguages() {
    try {
      const { data } = await restClient.get(`${SERVER}/languages`);
      setLanguages(data);
    } catch (e) {
      console.log(e);
    } finally {
      setStatus("success");
    }
  }

  async function fetchActors() {
    try {
      const { data } = await restClient.get(`${SERVER}/actors`);
      setActors(data);
    } catch (e) {
      console.log(e);
    } finally {
      setStatus("success");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const {
      title,
      description,
      file,
      genres,
      rating,
      releasedYear,
      price,
      length,
      trailerLink,
      language,
      actors,
    } = fData;

    if (title.length === 0) return alert("Please Enter Movie Title");
    if (description.length === 0)
      return alert("Please Enter Movie Description");
    if (!file) return alert("Please Select Movie Image");

    if (length.length === 0 || length === 0)
      return alert("Please Enter Movie Length in minutes");
    if (!parseInt(length)) return alert("Movie Length must be in number");

    if (releasedYear.length === 0 || releasedYear === 0)
      return alert("Please Enter Movie Release Year");
    if (!parseInt(releasedYear))
      return alert("Movie Released Year must be in number");

    if (trailerLink.length === 0 || !urlPattern.test(trailerLink))
      return alert("Please Enter valid Trailer Link");

    if (price.length === 0 || price === 0)
      return alert("Please Enter Movie Fee");
    if (!parseFloat(price)) return alert("Movie Fee must be in number");

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("file", file);
    genres?.forEach((g) => {
      form.append("genre[]", g.name);
    });
    form.append("rating", rating);
    form.append("releasedYear", releasedYear);
    form.append("price", price);
    form.append("length", length);
    form.append("trailerLink", trailerLink);
    // form.append("numberInStock", numberInStock);
    language?.forEach((g) => {
      form.append("language[]", g.language);
    });
    actors?.forEach((actor) => {
      form.append("actor[]", actor.name);
    });
    try {
      await restClient.post(`${SERVER}/movies`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/admin/movies");
    } catch (e) {
      const { status } = e.request;

      if (status === 401) {
        console.log(JSON.parse(e.request.response).message);
        return alert(JSON.parse(e.request.response).message);
      }
      alert("Please Fill all the values");
      console.log(e);
    }
  }

  function handleClose() {
    setActor({
      name: "",
      file: null,
    });
    setGenre({ name: "" });
    setLanguage({ name: "" });
    setActorError(errorDefaultState);
    setGenreError(errorDefaultState);
    setLanguageError(errorDefaultState);
    setModalOpen(modalDefaultState);
  }

  function hanldeOpenModal(key) {
    setModalOpen((prev) => {
      return { ...prev, [key]: true };
    });
  }

  function handleChangeActor(e) {
    const { name, value, files } = e.target;
    setActor({ ...actor, [name]: files ? files[0] : value });
  }

  function handleChangeLanguage(e) {
    const { name, value } = e.target;
    setLanguage({ ...genre, [name]: value });
  }

  function handleChangeGenre(e) {
    const { name, value } = e.target;
    setGenre({ ...genre, [name]: value });
  }

  function handleSubmitLangauge() {
    const { name } = language;

    const isLanguageValid = name.length >= 4;

    setLanguageError(
      isLanguageValid
        ? errorDefaultState
        : { status: true, message: "Language must be at least 4 characters" }
    );

    if (!isLanguageValid) return;
    handleCreateLanguage();
  }

  async function handleCreateLanguage() {
    setActorStatus(STATUS_TYPE.loading);
    try {
      await restClient.post(`${SERVER}/languages`, {
        language: language.name,
      });
      fetchLanguages();
      setTimeout(() => {
        setState({
          ...state,
          openSnackBar: true,
          message: "Language Successfully Added!",
        });
        setLanguage({
          name: "",
        });
        setModalOpen(modalDefaultState);
        setActorStatus(STATUS_TYPE.success);
      }, 1000);
    } catch (e) {
      setLanguageError({ status: true, message: e.response.data.message });
      console.log(e);
    }
  }

  function handleSubmitGenre() {
    const { name } = genre;

    const isGenreNameValid = name.length >= 3;

    setGenreError(
      isGenreNameValid
        ? errorDefaultState
        : { status: true, message: "Genre must be at least 3 characters" }
    );

    if (!isGenreNameValid) return;
    handleCreateGenre();
  }

  async function handleCreateGenre() {
    setActorStatus(STATUS_TYPE.loading);
    try {
      await restClient.post(`${SERVER}/genres`, {
        name: genre.name,
      });
      fetchGenre();
      setTimeout(() => {
        setState({
          ...state,
          openSnackBar: true,
          message: "Genre Successfully Added!",
        });
        setGenre({
          name: "",
        });
        setModalOpen(modalDefaultState);
        setActorStatus(STATUS_TYPE.success);
      }, 1000);
    } catch (e) {
      setGenreError({ status: true, message: e.response.data.message });
      setActorStatus(STATUS_TYPE.error);
      console.log(e);
    }
  }

  async function handleSubmitActor() {
    const { name } = actor;

    const isActorNameValid = name.length >= 3;

    setActorError(
      isActorNameValid
        ? errorDefaultState
        : {
            status: true,
            message: "Actor Name must be at least 3 characters",
          }
    );

    if (!isActorNameValid) return;

    handleCreateActor();
  }

  async function handleCreateActor() {
    setActorStatus(STATUS_TYPE.loading);

    const { name, file } = actor;
    const form = new FormData();

    form.append("name", name);
    form.append("file", file);

    try {
      await restClient.post(`${SERVER}/actors`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchActors();
      setTimeout(() => {
        setState({
          ...state,
          openSnackBar: true,
          message: "Actor Successfully Added!",
        });
        setActor({
          name: "",
          file: null,
        });
        setModalOpen(modalDefaultState);
        setActorStatus(STATUS_TYPE.success);
      }, 1000);
    } catch (e) {
      setActorError({ status: true, message: e.response.data.message });
      setActorStatus(STATUS_TYPE.error);
    }
  }

  useEffect(() => {
    setStatus("loading");
    fetchGenre();
    fetchLanguages();
    fetchActors();
  }, []);

  const isActorStatusLoading = actorStatus === STATUS_TYPE.loading;

  return (
    <Box
      sx={{
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ml: "18%",
      }}
    >
      {user.isAdmin ? <AdminNavigation /> : <UserNavigation />}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          px: 4,
          py: 2,
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography component="h1" variant="h5" color={Colors.primary}  sx={{ fontWeight: 'bold' }}>
          Movie Create Form
        </Typography>
        <Box sx={{ display: "flex", gap: 3, width: "100%", height: 65 }}>
          <TextInput
            id="title"
            label="Movie Title"
            value={fData.title}
            onChange={handleChange}
          />
          <TextInput
            id="description"
            label="Movie description"
            value={fData.description}
            onChange={handleChange}
          />
        </Box>
        <Button
          component="label"
          role={undefined}
          fullWidth
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
          sx={{
            // mb: 2,
            mt: 2,
            background: Colors.primary,

            "&:hover": { background: Colors.darkPrimary },
          }}
        >
          {fData.file ? fData.file.name : "Upload Image"}
          <VisuallyHiddenInput
            type="file"
            id="file"
            name="file"
            onChange={handleChange}
          />
        </Button>
        <Box sx={{ display: "flex", gap: 3, width: "100%" }}>
          {/* <TextInput
          id="numberInStock"
          label="Number InStock"
          value={fData.numberInStock}
          onChange={handleChange}
        /> */}
          <TextInput
            id="length"
            label="Movie Length"
            value={fData.length}
            onChange={handleChange}
          />
          <TextInput
            id="releasedYear"
            label="Movie Released Year"
            value={fData.releasedYear}
            onChange={handleChange}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 3, width: "100%" }}>
          <TextInput
            id="trailerLink"
            label="Movie Trailer Link"
            value={fData.trailerLink}
            onChange={handleChange}
          />
          <TextInput
            id="price"
            label="Moive Price"
            value={fData.price}
            onChange={handleChange}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 3, width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              gap: 4,
              mt: 1,
              mb: 2,
            }}
          >
            <Autocomplete
              multiple
              fullWidth
              value={fData.genres}
              onChange={(event, newValue) => {
                setFData({ ...fData, genres: newValue });
              }}
              filterSelectedOptions
              id="category-filter"
              options={genres}
              getOptionLabel={(option) => option?.name}
              isOptionEqualToValue={(option, value) => {
                if (option._id === value._id) return option._id === value._id;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Genres"
                  placeholder="Select genre of the movie"
                />
              )}
            />
            <Tooltip title="Add Genre">
              <IconButton
                aria-label="Add"
                color={"White"}
                onClick={() => hanldeOpenModal("genre")}
                sx={{
                  width: 40,
                  height: 40,
                  background: Colors.primary,
                  "&:hover": {
                    background: Colors.darkPrimary,
                  },
                }}
              >
                <LanguageIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              gap: 4,
              mt: 1,
              mb: 2,
            }}
          >
            <Autocomplete
              multiple
              fullWidth
              value={fData.language}
              onChange={(event, newValue) => {
                setFData({ ...fData, language: newValue });
              }}
              filterSelectedOptions
              id="category-filter"
              options={languages}
              getOptionLabel={(option) =>
                capitalizeFirstLetter(option?.language)
              }
              isOptionEqualToValue={(option, value) => {
                if (option._id === value._id) return option._id === value._id;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Languages"
                  placeholder="Select language(s) of the movie"
                />
              )}
            />

            <Tooltip title="Add Language">
              <IconButton
                aria-label="Add"
                color={"White"}
                onClick={() => hanldeOpenModal("language")}
                sx={{
                  width: 40,
                  height: 40,
                  background: Colors.primary,
                  "&:hover": {
                    background: Colors.darkPrimary,
                  },
                }}
              >
                <RedditIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              gap: 4,
              mt: 1,
              mb: 2,
            }}
          >
            <Autocomplete
              multiple
              fullWidth
              value={fData.actors}
              onChange={(event, newValue) => {
                setFData({ ...fData, actors: newValue });
              }}
              filterSelectedOptions
              id="category-filter"
              options={actors}
              getOptionLabel={(option) => option?.name}
              isOptionEqualToValue={(option, value) => {
                if (option._id === value._id) return option._id === value._id;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Actors"
                  placeholder="Select actors of the movie"
                />
              )}
            />
            <Tooltip title="Add Actor">
              <IconButton
                aria-label="Add"
                color={"White"}
                onClick={() => hanldeOpenModal("actor")}
                sx={{
                  width: 40,
                  height: 40,
                  background: Colors.primary,
                  "&:hover": {
                    background: Colors.darkPrimary,
                  },
                }}
              >
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "row", ml: 1, gap: 2 }}>
              <Typography variant="h6" gutterBottom>
                Rating
              </Typography>
              <Rating
                value={fData.rating}
                defaultValue={1}
                id="rating"
                sx={{ mt: 0.5 }}
                onChange={(event, newValue) => {
                  setFData((prev) => {
                    return { ...prev, rating: newValue };
                  });
                }}
              />
            </Box>
            <GenericButton type="submit" text="Submit" />
          </Box>
        </Box>
      </Box>

      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={state.openSnackBar}
        onClose={handleCloseSnackBar}
        autoHideDuration={3000}
        key={vertical + horizontal}
      >
        <Alert
          onClose={handleCloseSnackBar}
          variant="filled"
          sx={{ width: "100%", background: Colors.primary }}
        >
          {state.message}
        </Alert>
      </Snackbar>

      <ActorGenreLanguageCreateModal
        open={modalOpen.language}
        onClose={handleClose}
        onChange={handleChangeLanguage}
        onCreate={handleSubmitLangauge}
        data={language}
        isLoading={isActorStatusLoading}
        openSnackBar={openSnackBar}
        error={languageError}
        type="language"
      />
      <ActorGenreLanguageCreateModal
        open={modalOpen.genre}
        onClose={handleClose}
        onChange={handleChangeGenre}
        onCreate={handleSubmitGenre}
        data={genre}
        isLoading={isActorStatusLoading}
        openSnackBar={openSnackBar}
        error={genreError}
        type="genre"
      />
      <ActorGenreLanguageCreateModal
        open={modalOpen.actor}
        onClose={handleClose}
        onChange={handleChangeActor}
        onCreate={handleSubmitActor}
        data={actor}
        isLoading={isActorStatusLoading}
        openSnackBar={openSnackBar}
        error={actorError}
        type="actor"
      />
    </Box>
  );
}
