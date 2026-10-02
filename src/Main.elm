module Main exposing (init, main, title, view)

import Browser
import Config exposing (Config)
import Html exposing (Html, h1, li, text, ul)
import Json.Decode exposing (Value)


title : String
title =
    "Growth Cells"


main : Program Value Model Never
main =
    Browser.element
        { init = init
        , update = \_ model -> ( model, Cmd.none )
        , view = view
        , subscriptions = \_ -> Sub.none
        }


view : Model -> Html Never
view model =
    case model of
        Ready config ->
            let
                summary =
                    "Up to " ++ String.fromInt (config.startCells * 2 ^ config.epochs) ++ " cells"
            in
            h1 [] [ text summary ]

        Invalid errors ->
            ul [] (List.map (\e -> li [] [ text e ]) errors)


type Model
    = Invalid (List String)
    | Ready Config


init : Value -> ( Model, Cmd Never )
init flags =
    case Config.decode flags of
        Ok config ->
            ( Ready config, Cmd.none )

        Err errors ->
            ( Invalid errors, Cmd.none )
