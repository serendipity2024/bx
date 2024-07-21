// Generate required css
import * as BuilderX from "@builderx-core/builderx";

// @ts-ignore
import fontMaterialIcons from "react-native-vector-icons/Fonts/MaterialIcons.ttf";
const fontStylesMaterialIcons = `@font-face { src: url(${fontMaterialIcons}); font-family: MaterialIcons; font-display: fallback;}`;
// @ts-ignore
import fontAntDesign from "react-native-vector-icons/Fonts/AntDesign.ttf";
const fontStylesAntDesign = `@font-face { src: url(${fontAntDesign}); font-family: AntDesign; font-display: fallback;}`;
// @ts-ignore
import fontFontAwesome5Regular from "react-native-vector-icons/Fonts/FontAwesome5_Regular.ttf";
// tslint:disable-next-line: max-line-length
const fontStylesFontAwesome5Regular = `@font-face { src: url(${fontFontAwesome5Regular}); font-family: FontAwesome5_Solid; font-weight:900;font-display: fallback;}`;
// @ts-ignore
import fontFontAwesome5Brands from "react-native-vector-icons/Fonts/FontAwesome5_Brands.ttf";
// tslint:disable-next-line: max-line-length
const fontStylesFontAwesome5Brands = `@font-face { src: url(${fontFontAwesome5Brands}); font-family: FontAwesome5_Solid; font-weight:900;font-display: fallback;}`;
// @ts-ignore
import fontFontAwesome5Solid from "react-native-vector-icons/Fonts/FontAwesome5_Solid.ttf";
// tslint:disable-next-line: max-line-length
const fontStylesFontAwesome5Solid = `@font-face { src: url(${fontFontAwesome5Solid}); font-family: FontAwesome5_Solid; font-weight:900;font-display: fallback;}`;
// @ts-ignore
import fontFontAwesome from "react-native-vector-icons/Fonts/FontAwesome.ttf";
const fontStylesFontAwesome = `@font-face { src: url(${fontFontAwesome}); font-family: FontAwesome; font-display: fallback;}`;
// @ts-ignore
import fontZocial from "react-native-vector-icons/Fonts/Zocial.ttf";
const fontStylesZocial = `@font-face { src: url(${fontZocial}); font-family: Zocial; font-display: fallback;}`;
// @ts-ignore
import fontOcticons from "react-native-vector-icons/Fonts/Octicons.ttf";
const fontStylesOcticons = `@font-face { src: url(${fontOcticons}); font-family: Octicons; font-display: fallback;}`;
// @ts-ignore
import fontMaterialCommunityIcons from "react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf";
const fontStylesMaterialCommunityIcons = `@font-face { src: url(${fontMaterialCommunityIcons});
font-family: MaterialCommunityIcons; font-display: fallback;}`;
// @ts-ignore
import fontFoundation from "react-native-vector-icons/Fonts/Foundation.ttf";
const fontStylesFoundation = `@font-face { src: url(${fontFoundation}); font-family: Foundation; font-display: fallback;}`;
// @ts-ignore
import fontSimpleLineIcons from "react-native-vector-icons/Fonts/SimpleLineIcons.ttf";
const fontStylesSimpleLineIcons = `@font-face { src: url(${fontSimpleLineIcons}); font-family: SimpleLineIcons; font-display: fallback;}`;
// @ts-ignore
import fontEvilIcons from "react-native-vector-icons/Fonts/EvilIcons.ttf";
const fontStylesEvilIcons = `@font-face { src: url(${fontEvilIcons}); font-family: EvilIcons; font-display: fallback;}`;
// @ts-ignore
import fontEntypo from "react-native-vector-icons/Fonts/Entypo.ttf";
const fontStylesEntypo = `@font-face { src: url(${fontEntypo}); font-family: Entypo; font-display: fallback;}`;
// @ts-ignore
import fontIonicons from "react-native-vector-icons/Fonts/Ionicons.ttf";
const fontStylesIonicons = `@font-face { src: url(${fontIonicons}); font-family: Ionicons; font-display: fallback;}`;
// @ts-ignore
import fontFeather from "react-native-vector-icons/Fonts/Feather.ttf";
const fontStylesFeather = `@font-face { src: url(${fontFeather}); font-family: Feather; font-display: fallback;}`;

// // @ts-ignore
// import sfProDisplay from "../fonts/SF-Pro-Display-Regular.ttf";
// const sfProDisplayStyle = `@font-face { src: url(${sfProDisplay}); font-family: SFProDisplay; }`;

// // @ts-ignore
// import sfProText from "../fonts/SF-Pro-Text-Regular.ttf";
// const sfProTextStyle = `@font-face { src: url(${sfProText}); font-family: SFProText; }`;

// // @ts-ignore
// import roboto from "../fonts/roboto-regular.ttf";
// const robotoStyle = `@font-face { src: url(${roboto}); font-family: Roboto; }`;

export const fonts = [
  fontStylesMaterialIcons,
  fontStylesFontAwesome,
  fontStylesFontAwesome5Solid,
  fontStylesFontAwesome5Regular,
  fontStylesFontAwesome5Brands,
  fontStylesZocial,
  fontStylesOcticons,
  fontStylesMaterialCommunityIcons,
  fontStylesFoundation,
  fontStylesSimpleLineIcons,
  fontStylesEvilIcons,
  fontStylesEntypo,
  fontStylesIonicons,
  fontStylesFeather,
  fontStylesAntDesign,
];

export const loadFonts = () => {
  BuilderX.loadFonts(fonts);
};
