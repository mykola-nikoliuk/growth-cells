module Config exposing (Config, decode, maxCells)

{-| The settings an author, the LLM content agent or the tutor gives the component.
-}

import Json.Decode exposing (Value, decodeValue, field, float, int, keyValuePairs, value)


type alias Config =
    { startCells : Int
    , epochs : Int
    , splitChance : Float
    , splitPeriod : Float
    }


{-| The most cells the board can hold: start cells × 2 ^ epochs must stay within it.
-}
maxCells : Int
maxCells =
    16384


readInt : String -> Int -> Int -> Value -> Result String Int
readInt propName min max json =
    case decodeValue (field propName value) json of
        Ok v ->
            case decodeValue int v of
                Ok n ->
                    if n < min || n > max then
                        Err
                            ("\""
                                ++ propName
                                ++ "\" must be a whole number from "
                                ++ String.fromInt min
                                ++ " to "
                                ++ String.fromInt max
                                ++ "."
                            )

                    else
                        Ok n

                Err _ ->
                    Err ("\"" ++ propName ++ "\" must be a whole number from " ++ String.fromInt min ++ " to " ++ String.fromInt max ++ ".")

        Err _ ->
            Err ("\"" ++ propName ++ "\" is missing: give a whole number from " ++ String.fromInt min ++ " to " ++ String.fromInt max ++ ".")


readFloat : String -> (Float -> Bool) -> String -> Value -> Result String Float
readFloat propName check errorText json =
    case decodeValue (field propName value) json of
        Ok v ->
            case decodeValue float v of
                Ok n ->
                    if check n then
                        Ok n

                    else
                        Err
                            ("\""
                                ++ propName
                                ++ "\" must be "
                                ++ errorText
                            )

                Err _ ->
                    Err
                        ("\""
                            ++ propName
                            ++ "\" must be "
                            ++ errorText
                        )

        Err _ ->
            Err ("\"" ++ propName ++ "\" is missing: give a whole number from 1 to 64.")


errorsOf : Result String a -> List String
errorsOf res =
    case res of
        Ok _ ->
            []

        Err error ->
            [ error ]


{-| Reads a config from untrusted JSON. On failure, lists every problem at once, each in a
sentence an LLM can act on.

Limits: startCells 1–64, epochs 1–14, splitChance above 0 and at most 1, splitPeriod 0.5–10
seconds, and startCells × 2 ^ epochs at most maxCells.

-}
decode : Value -> Result (List String) Config
decode json =
    case decodeValue (keyValuePairs value) json of
        Ok _ ->
            decodeFields json

        Err _ ->
            Err [ "The config must be a JSON object." ]


decodeFields : Value -> Result (List String) Config
decodeFields json =
    let
        startCells =
            readInt "startCells" 1 64 json

        epochs =
            readInt "epochs" 1 14 json

        splitChance =
            readFloat "splitChance" (\c -> c > 0 && c <= 1) "above 0 and at most 1." json

        splitPeriod =
            readFloat "splitPeriod" (\c -> c >= 0.5 && c <= 10) "from 0.5 to 10 seconds." json

        errors =
            List.concat [ errorsOf startCells, errorsOf epochs, errorsOf splitChance, errorsOf splitPeriod ]
    in
    case Result.map4 Config startCells epochs splitChance splitPeriod of
        Ok config ->
            checkPopulation config

        Err _ ->
            Err errors


halvings : Int -> Int
halvings room =
    if room < 2 then
        0

    else
        1 + halvings (room // 2)


checkPopulation : Config -> Result (List String) Config
checkPopulation config =
    let
        cells =
            config.startCells * 2 ^ config.epochs

        error =
            String.fromInt config.startCells
                ++ " start cells × 2"
                ++ "^"
                ++ String.fromInt config.epochs
                ++ " = "
                ++ String.fromInt cells
                ++ " cells, but the board holds "
                ++ String.fromInt maxCells
                ++ """. Lower "epochs" to """
                ++ String.fromInt (halvings (maxCells // config.startCells))
                ++ """ or "startCells" to """
                ++ String.fromInt (maxCells // 2 ^ config.epochs)
                ++ "."
    in
    if cells <= maxCells then
        Ok config

    else
        Err [ error ]
