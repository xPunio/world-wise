// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useState, useEffect } from "react";
import Button from "./Button";
import styles from "./Form.module.css";
import ButtonBack from "./ButtonBack";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Message from "./Message";
import Spinner from "./Spinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
    const [lat, lng] = useUrlPosition();
    const { createCity, isLoading } = useCities();
    const navigate = useNavigate();

    const [cityName, setCityName] = useState("");
    const [country, setCountry] = useState("");
    const [date, setDate] = useState(new Date());
    const [notes, setNotes] = useState("");

    const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
    const [geocodingError, setGeocodingError] = useState("");

    const [emoji, setEmoji] = useState("");

    useEffect(() => {
        async function fetchCityData() {
            try {
                setIsLoadingGeocoding(true);
                setGeocodingError("");
                const res = await fetch(
                    `${BASE_URL}?latitude=${lat}&longitude=${lng}`
                );
                const data = await res.json();

                if (!data.countryCode)
                    throw new Error("That doesn't seem to be a city");

                setCityName(data.city || data.locality || "");
                setCountry(data.countryName || "");
                setEmoji(convertToEmoji(data.countryCode || ""));
            } catch (err) {
                setGeocodingError(err.message);
            } finally {
                setIsLoadingGeocoding(false);
            }
        }
        fetchCityData();
    }, [lat, lng]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!cityName || !date) return;
        const newCity = {
            cityName,
            country,
            emoji,
            date,
            notes,
            position: { lat, lng },
        };
        await createCity(newCity);
        navigate("/app/cities");
    }

    if (geocodingError) return <Message message={geocodingError} />;

    if (isLoadingGeocoding) return <Spinner />;

    return (
        <form
            className={`${styles.form} ${isLoading ? styles.loading : ""}`}
            onSubmit={handleSubmit}
        >
            <div className={styles.row}>
                <label htmlFor="cityName">City name</label>
                <input
                    id="cityName"
                    onChange={(e) => setCityName(e.target.value)}
                    value={cityName}
                />
                <span className={styles.flag}>{emoji}</span>
            </div>

            <div className={styles.row}>
                <label htmlFor="date">When did you go to {cityName}?</label>
                {/* <input
                    id="date"
                    onChange={(e) => setDate(e.target.value)}
                    value={date}
                /> */}
                <DatePicker
                    id="date"
                    selected={date}
                    onChange={(date) => setDate(date)}
                    dateFormat="dd/MM/yyyy"
                />
            </div>

            <div className={styles.row}>
                <label htmlFor="notes">
                    Notes about your trip to {cityName}
                </label>
                <textarea
                    id="notes"
                    onChange={(e) => setNotes(e.target.value)}
                    value={notes}
                />
            </div>

            <div className={styles.buttons}>
                <Button type="primary">Add</Button>
            </div>
            <ButtonBack />
        </form>
    );
}

export default Form;
