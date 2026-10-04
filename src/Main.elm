port module Main exposing (Msg(..), init, main, title, update, view)

import Browser
import Config exposing (Config)
import Html exposing (Html, div, h1, h2, li, text, ul)
import Json.Decode exposing (Value)


title : String
title =
    "Growth Cells"


main : Program Value Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


view : Model -> Html Msg
view model =
    case model of
        Ready config progress ->
            let
                summary =
                    "Up to " ++ String.fromInt (config.startCells * 2 ^ config.epochs) ++ " cells"

                status =
                    "Epoch "
                        ++ String.fromInt progress.epoch
                        ++ " · "
                        ++ String.fromInt progress.total
                        ++ " cells"
            in
            div []
                [ h1 [] [ text summary ]
                , h2 [] [ text status ]
                ]

        Invalid errors ->
            ul [] (List.map (\e -> li [] [ text e ]) errors)


type alias Progress =
    { epoch : Int, total : Int, marked : Int }


type Model
    = Invalid (List String)
    | Ready Config Progress


type Msg
    = EpochChanged Progress


init : Value -> ( Model, Cmd Msg )
init flags =
    case Config.decode flags of
        Ok config ->
            ( Ready config { epoch = 0, total = config.startCells, marked = 0 }, restart config )

        Err errors ->
            ( Invalid errors, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions _ =
    epochChanged EpochChanged


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        EpochChanged progress ->
            case model of
                Ready config _ ->
                    ( Ready config progress, Cmd.none )

                Invalid _ ->
                    ( model, Cmd.none )


port restart : Config -> Cmd msg


port epochChanged : (Progress -> msg) -> Sub msg
