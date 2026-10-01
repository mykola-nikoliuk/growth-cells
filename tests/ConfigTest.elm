module ConfigTest exposing (suite)

import Config
import Expect
import Json.Encode as E
import Test exposing (Test, describe, test)


valid : List ( String, E.Value )
valid =
    [ ( "startCells", E.int 2 )
    , ( "epochs", E.int 10 )
    , ( "splitChance", E.float 1 )
    , ( "splitPeriod", E.float 2 )
    ]


{-| The valid config with some fields replaced or added.
-}
with : List ( String, E.Value ) -> E.Value
with changes =
    let
        keys =
            List.map Tuple.first changes
    in
    E.object (changes ++ List.filter (\( key, _ ) -> not (List.member key keys)) valid)


errorsOf : E.Value -> List String
errorsOf value =
    case Config.decode value of
        Ok _ ->
            []

        Err errors ->
            errors


suite : Test
suite =
    describe "Config.decode"
        [ test "reads a valid config" <|
            \_ ->
                Config.decode (E.object valid)
                    |> Expect.equal
                        (Ok { startCells = 2, epochs = 10, splitChance = 1, splitPeriod = 2 })
        , test "names a missing field" <|
            \_ ->
                E.object (List.drop 1 valid)
                    |> errorsOf
                    |> Expect.equal [ "\"startCells\" is missing: give a whole number from 1 to 64." ]
        , test "names a field of the wrong type" <|
            \_ ->
                with [ ( "epochs", E.string "ten" ) ]
                    |> errorsOf
                    |> Expect.equal [ "\"epochs\" must be a whole number from 1 to 14." ]
        , test "rejects values out of range" <|
            \_ ->
                with [ ( "splitChance", E.float 0 ), ( "splitPeriod", E.float 20 ) ]
                    |> errorsOf
                    |> Expect.equal
                        [ "\"splitChance\" must be above 0 and at most 1."
                        , "\"splitPeriod\" must be from 0.5 to 10 seconds."
                        ]
        , test "says how to fit a population that would not fit the board" <|
            \_ ->
                with [ ( "startCells", E.int 4 ), ( "epochs", E.int 13 ) ]
                    |> errorsOf
                    |> Expect.equal
                        [ "4 start cells × 2^13 = 32768 cells, but the board holds 16384. Lower \"epochs\" to 12 or \"startCells\" to 2." ]
        , test "checks the population only once the parts are valid" <|
            \_ ->
                with [ ( "startCells", E.int 64 ), ( "epochs", E.int 0 ) ]
                    |> errorsOf
                    |> Expect.equal [ "\"epochs\" must be a whole number from 1 to 14." ]
        , test "lists every problem at once" <|
            \_ ->
                E.object []
                    |> errorsOf
                    |> List.length
                    |> Expect.equal 4
        , test "rejects something that is not an object" <|
            \_ ->
                E.list E.int [ 1 ]
                    |> errorsOf
                    |> Expect.equal [ "The config must be a JSON object." ]
        ]
