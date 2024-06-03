import {
  Chip,
  Paper,
  Rating,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SERVER } from "../../constants";
import restClient from "../../helpers/restClient";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  capitalizeFirstLetter,
  formatReadableDate,
} from "../../helpers/textHelper";
import AdminNavigation from "../Navigation/AdminNavigation";
import UserNavigation from "../Navigation/UserNavigation";

export default function MovieDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState("idle");
  const [movie, setMovie] = useState({});
  const [rentDate, setRentDate] = useState(1);
  const [rentId, setRentId] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  async function getMovieDetails() {
    try {
      const response = await restClient.get(`${SERVER}/movies/${id}`);
      setMovie(response.data);
      setStatus((prev) => "success");
    } catch (e) {
      console.log(e);
    }
  }

  async function getRental() {
    try {
      const { data } = await restClient.get(
        `${SERVER}/rentals?customerId=${user._id}`
      );
      const movie = data.find((item) => item.movie._id === id);
      if (!movie) return null;

      setRentId(movie._id);
      setRentDate(movie.rentalDate);
      setIsUpdate(true);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    setStatus((prev) => "loading");
    getMovieDetails();
    getRental();
  }, []);

  async function createRent() {
    const reqBody = {
      customerId: user._id,
      movieId: movie._id,
      rentalDate: rentDate,
    };
    if (rentDate <= 0) return alert("Please lend a day at least!");
    try {
      const { data } = await restClient.post(`${SERVER}/rentals`, reqBody);
      setMovie({ ...movie, rentalDate: data.rental.rentalDate });
      setOpenSnackbar(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.log(e);
    }
  }

  async function updateRent() {
    const reqBody = {
      rentalDate: rentDate,
      dailyRentalRate: movie.dailyRentalRate,
    };
    try {
      await restClient.put(`${SERVER}/rentals?id=${rentId}`, reqBody);
      setOpenSnackbar(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.log(e.message);
    }
  }

  async function handleRent() {
    isUpdate ? updateRent() : createRent();
  }

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isIdle = status === "idle";

  if (isIdle) return <p>Please Wait! Server is Loading</p>;
  if (isLoading) return <p>Loading</p>;
  if (isSuccess)
    return (
      <Box>
        {user.isAdmin ? <AdminNavigation /> : <UserNavigation />}
        <Typography variant="h3" component="div" sx={{ mt: 5, mb: 1 }}>
          {/* {capitalizeFirstLetterinSentence(movie.title)} */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
            message={
              isUpdate
                ? "Video Rental Date Successfully Updated"
                : "Video Successfully Rented!"
            }
          />
        </Typography>
        <Paper
          sx={{
            display: "flex",
            width: "60%",
            ml: "20%",
            gap: 5,
            padding: 2,
          }}
          elevation={6}
        >
          <Box
            sx={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              justifyItems: "center",
              pt: 2,
              pl: 4,
            }}
          >
            <img
              src={`../../../public/${movie.image.name}`}
              alt="Movie Image"
            />
            <Button
              variant="contained"
              sx={{ mt: 1 }}
              onClick={handleRent}
              disabled={movie.numberInStock === 0 && !isUpdate}
            >
              {isUpdate ? "Update Rent Date" : "Rent"}
            </Button>
            <TextField
              type={"number"}
              margin="normal"
              required
              disabled={isUpdate}
              fullWidth
              id="rentDay"
              label="Total Rent Date"
              name="rentDay"
              autoComplete="rentDay"
              value={rentDate}
              onChange={(e) => setRentDate(e.target.value)}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyItems: "center",
            }}
          >
            <Typography variant="h3" component="div" sx={{ mt: 1, mb: 1 }}>
              {movie.title}
            </Typography>
            <Box mb={3}>
              {movie.genre.map((g) => (
                <Chip
                  label={g.name}
                  sx={{ mr: 1 }}
                  key={g._id}
                  color="success"
                  variant="filled"
                />
              ))}
            </Box>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              sx={{ mb: 2 }}
              onClick={() =>
                window.open(
                  "https://www.youtube.com/watch?v=iH6FdW39Hag&ab_channel=RottenTomatoesClassicTrailers"
                )
              }
            >
              Watch Trailer
            </Button>
            <Typography variant="h6">Overview</Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: "left", marginBottom: 2 }}
            >
              {movie.description}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }} gutterBottom>
              Duration: {movie.length} minutes
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }} gutterBottom>
              Released Date:{movie.releasedYear}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }} gutterBottom>
              Rating:
              <Rating
                name="read-only"
                value={movie.rating}
                readOnly
                size="small"
                sx={{ position: "absolute" }}
              />
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }} gutterBottom>
              Stock: {movie.numberInStock}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }} gutterBottom>
              Fee: {movie.dailyRentalRate}$ per Day
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }} gutterBottom>
              Language:
              {movie.language.map((g) => (
                <Chip
                  label={capitalizeFirstLetter(g.language)}
                  sx={{ ml: 1 }}
                  key={g._id}
                  color="warning"
                  variant="filled"
                />
              ))}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
}
