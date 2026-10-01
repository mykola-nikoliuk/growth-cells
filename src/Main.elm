module Main exposing (main, title)

import Browser
import Html exposing (Html, h1, text)


title : String
title =
    "Growth Cells"


main : Program () () Never
main =
    Browser.element
        { init = \_ -> ( (), Cmd.none )
        , update = \_ model -> ( model, Cmd.none )
        , view = \_ -> view
        , subscriptions = \_ -> Sub.none
        }


view : Html Never
view =
    h1 [] [ text title ]
