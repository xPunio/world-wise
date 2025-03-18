import { createContext, useEffect, useContext, useReducer } from "react";

const BASE_URL = "http://localhost:8000";

const CitiesContext = createContext();

const initialState = {
    cities: [],
    isLoading: false,
    currentCity: {},
    error: "",
};
function reducer(state, action) {
    switch (action.type) {
        case "loading":
            return { ...state, isLoading: true };
        case "cities/loaded":
            return { ...state, isLoading: false, cities: action.payload };
        case "city/loaded":
            return { ...state, isLoading: false, currentCity: action.payload };
        case "cities/created":
            return {
                ...state,
                cities: [...state.cities, action.payload],
                currentCity: action.payload,
            };
        case "cities/deleted":
            return {
                ...state,
                cities: state.cities.filter(
                    (city) => city.id !== action.payload
                ),
                currentCity: {},
            };
        case "rejected":
            return { ...state, isLoading: false, error: action.payload };
        default:
            throw new Error("Action unknown");
    }
}

function CitiesProvider({ children }) {
    const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
        reducer,
        initialState
    );

    useEffect(() => {
        async function fetchCities() {
            dispatch({ type: "loading" });
            try {
                const res = await fetch(`${BASE_URL}/cities`);
                const data = await res.json();
                dispatch({ type: "cities/loaded", payload: data });
            } catch (error) {
                dispatch({ type: "rejected", payload: error.message });
            }
        }
        fetchCities();
    }, []);

    async function getCity(id) {
        if (Number(id) === currentCity.id) return;
        dispatch({ type: "loading" });
        try {
            const res = await fetch(`${BASE_URL}/cities/${id}`);
            const data = await res.json();
            dispatch({ type: "city/loaded", payload: data });
        } catch (error) {
            dispatch({ type: "rejected", payload: error.message });
        }
    }

    async function createCity(newCity) {
        dispatch({ type: "loading" });
        try {
            const res = await fetch(`${BASE_URL}/cities`, {
                method: "POST",
                body: JSON.stringify(newCity),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();

            dispatch({ type: "cities/created", payload: data });
        } catch (error) {
            dispatch({ type: "rejected", payload: error.message });
        }
    }
    async function deleteCity(id) {
        dispatch({ type: "loading" });
        try {
            await fetch(`${BASE_URL}/cities/${id}`, {
                method: "DELETE",
            });

            dispatch({ type: "cities/deleted", payload: id });
        } catch (error) {
            dispatch({ type: "rejected", payload: error.message });
        }
    }

    return (
        <CitiesContext.Provider
            value={{
                cities,
                isLoading,
                currentCity,
                getCity,
                createCity,
                deleteCity,
                error,
            }}
        >
            {children}
        </CitiesContext.Provider>
    );
}

function useCities() {
    const context = useContext(CitiesContext);
    if (context === undefined)
        throw new Error("CitiesContext was used outside the CitiesProvider");
    return context;
}

export { CitiesProvider, useCities };
